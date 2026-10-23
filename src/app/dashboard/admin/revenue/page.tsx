"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { isApiError } from "@/lib/api/client";
import { getAdminRevenueApi, getAdminScansApi, regenerateAdminScanApi } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { AdminRevenue } from "@/types/api";

function money(subunits: number, currency: string) {
  return `${currency} ${(subunits / 100).toFixed(2)}`;
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<AdminRevenue | null>(null);
  const [scans, setScans] = useState<readonly { id: number; status?: string; url?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminRevenueApi();
      setData(res.data ?? null);
      try {
        const scanRes = await getAdminScansApi();
        setScans((scanRes.data as { id: number; status?: string; url?: string }[]) ?? []);
      } catch {
        setScans([]);
      }
      setError(null);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Unable to load revenue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totals = useMemo(
    () => (data?.totals ?? []).filter((row) => row.type !== "donation"),
    [data]
  );

  const stuckOrFailed = scans.filter(
    (scan) => scan.status === "report_failed" || scan.status === "generating_full_report"
  );

  if (loading) return <Skeleton className="h-80 w-full" />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">No revenue data yet.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold">Revenue</h3>
        <p className="text-sm text-muted-foreground">Report unlocks and Pro subscriptions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {totals.map((row) => (
          <Card key={`${row.type}-${row.currency}`} className="p-5">
            <p className="text-xs uppercase text-muted-foreground">{row.type} · {row.currency}</p>
            <p className="mt-2 text-2xl font-bold">{money(row.amountSubunits, row.currency)}</p>
            <p className="text-sm text-muted-foreground">
              {row.count} payments · last 30 days {money(row.last30DaysSubunits, row.currency)}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-semibold">Reports</p>
          <p className="mt-2 text-sm">Paid {data.scans.paidScans} · delivered {data.scans.deliveredReports}</p>
          <div className="mt-3 flex gap-2">
            <Badge variant="outline" className="border-amber-500/30 text-amber-700">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Stuck {data.scans.stuckReports}
            </Badge>
            <Badge variant="outline" className="border-rose-500/30 text-rose-700">
              Failed {data.scans.failedReports}
            </Badge>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold">Subscriptions</p>
          <p className="mt-2 text-sm">
            Active {data.subscriptions.activeSubscriptions} · past due {data.subscriptions.pastDueSubscriptions}
          </p>
        </Card>
      </div>

      {stuckOrFailed.length > 0 ? (
        <Card className="p-5">
          <h4 className="mb-3 font-semibold">Stuck and failed reports</h4>
          <ul className="space-y-2 text-sm">
            {stuckOrFailed.map((scan) => (
              <li key={scan.id} className="flex items-center justify-between gap-3">
                <span>
                  #{scan.id} {scan.url} · {scan.status}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await regenerateAdminScanApi(scan.id);
                    toast({ title: "Regeneration started" });
                    await load();
                  }}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.recentPayments.filter((row) => row.type !== "donation").length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No payments yet.
                </TableCell>
              </TableRow>
            ) : (
              data.recentPayments
                .filter((row) => row.type !== "donation")
                .map((row) => (
                  <TableRow key={String(row.id)}>
                    <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{money(row.amountSubunits, row.currency)}</TableCell>
                    <TableCell>{row.email ?? "—"}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

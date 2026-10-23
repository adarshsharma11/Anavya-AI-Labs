"use client";

import { useEffect, useState } from "react";

import { isApiError } from "@/lib/api/client";
import { getAdminGeoLeadsApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GeoLead } from "@/types/api";

export default function AdminGeoLeadsPage() {
  const [leads, setLeads] = useState<readonly GeoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminGeoLeadsApi(200)
      .then((res) => setLeads(res.data ?? []))
      .catch((err) => setError(isApiError(err) ? err.message : "Unable to load leads."))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    const header = "id,url,email,userId,score,createdAt";
    const rows = leads.map((lead) =>
      [lead.id, lead.url, lead.email ?? "", lead.userId ?? "", lead.score ?? "", lead.createdAt]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "geo-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">GEO leads</h3>
          <p className="text-sm text-muted-foreground">Emails captured from GEO checks.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={leads.length === 0}>
          Export CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No leads yet.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="max-w-[240px] truncate">{lead.url}</TableCell>
                  <TableCell>{lead.email ?? "—"}</TableCell>
                  <TableCell>{lead.score ?? "—"}</TableCell>
                  <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

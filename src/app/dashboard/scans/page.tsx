"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, Eye, FileSearch, Loader2 } from "lucide-react";

import { getScansApi } from "@/lib/api/dashboard";
import { usePdfDownload } from "@/hooks/use-pdf-download";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
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
import { scoreToneClass } from "@/components/report/score-utils";
import type { DashboardScan } from "@/types/api";
import { isApiError } from "@/lib/api/client";

export default function ScansHistoryPage() {
  const [scans, setScans] = useState<readonly DashboardScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const pdf = usePdfDownload();
  const { toast } = useToast();

  useEffect(() => {
    getScansApi()
      .then((res) => setScans(res.scans))
      .catch((err) =>
        setError(isApiError(err) ? err.message : "Unable to load scans.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Scan History</h3>
        <p className="mt-1 text-muted-foreground">
          Open shareable reports and download the free PDF.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-lg">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>AEO / GEO</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Skeleton className="h-48 w-full" />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : scans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                  <FileSearch className="mx-auto mb-3 h-8 w-8 opacity-50" />
                  No scans yet.
                  <div className="mt-3">
                    <Button variant="outline" asChild>
                      <Link href="/scanner">Run a Scan</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              scans.map((scan) => (
                <TableRow key={scan.publicId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="inline-block max-w-[200px] truncate">{scan.url}</span>
                      <Link href={scan.url} target="_blank" className="text-muted-foreground">
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={scoreToneClass(scan.overall)}>
                      {scan.overall ?? "—"} {scan.verdict ? `· ${scan.verdict}` : ""}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-1">
                    {scan.reportVersion === 2 ? (
                      <>
                        <Badge variant="outline">AEO {scan.categories?.aeo ?? "—"}</Badge>
                        <Badge variant="outline">GEO {scan.categories?.geo ?? "—"}</Badge>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Legacy scan</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/scanner?id=${scan.publicId}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={downloadingId === scan.publicId}
                        onClick={async () => {
                          setDownloadingId(scan.publicId);
                          await pdf.download(scan.publicId, scan.url);
                          setDownloadingId(null);
                          toast({ title: "PDF ready" });
                        }}
                      >
                        {downloadingId === scan.publicId ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        PDF
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

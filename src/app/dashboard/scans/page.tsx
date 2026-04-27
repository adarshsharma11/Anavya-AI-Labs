"use client";

import React, { useEffect, useState } from "react";
import { getScansApi, downloadPdfApi } from "@/lib/api/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, ExternalLink, Loader2, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ScansHistoryPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getScansApi()
      .then((res) => {
        if (res.success) setScans(res.scans);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (id: number) => {
    setDownloadingId(id);
    try {
      const blob = await downloadPdfApi(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Anavya-Audit-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Success", description: "PDF downloaded successfully" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Download Failed", description: err.message });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 lg:py-8">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Scan History</h3>
        <p className="text-muted-foreground">View and download white-label PDF reports of your past audits.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : scans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No scans found. Start by analyzing a website!
                </TableCell>
              </TableRow>
            ) : (
              scans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                       <span className="truncate max-w-[200px] inline-block">{scan.url}</span>
                       <Link href={scan.url} target="_blank" className="text-muted-foreground hover:text-primary">
                         <ExternalLink className="h-3 w-3" />
                       </Link>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(scan.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={scan.preview?.overall >= 80 ? "default" : scan.preview?.overall >= 50 ? "secondary" : "destructive"}>
                      {scan.preview?.overall || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>{scan.preview?.verdict || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/scanner?id=${scan.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(scan.id)}
                        disabled={downloadingId === scan.id}
                      >
                        {downloadingId === scan.id ? (
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

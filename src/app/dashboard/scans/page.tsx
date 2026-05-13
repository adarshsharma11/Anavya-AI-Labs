"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getScansApi, downloadPdfApi } from "@/lib/api/dashboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, ExternalLink, Loader2, Eye, FileSearch } from "lucide-react";
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">Scan History</h3>
        <p className="text-muted-foreground mt-1">View and download white-label PDF reports of your past audits.</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-background/80 shadow-lg backdrop-blur overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border/60">
              <TableHead className="font-semibold">URL</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Score</TableHead>
              <TableHead className="font-semibold">Verdict</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-48">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                    <p>Loading your scans...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : scans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-48">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="rounded-full bg-muted/50 p-4 mb-4">
                      <FileSearch className="h-8 w-8 opacity-50" />
                    </div>
                    <p>No scans found. Start by analyzing a website!</p>
                    <Button variant="outline" asChild className="mt-4">
                      <Link href="/scanner">Run a Scan</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              scans.map((scan) => (
                <TableRow key={scan.id} className="border-border/60 hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                       <span className="truncate max-w-[200px] inline-block">{scan.url}</span>
                       <Link href={scan.url} target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                         <ExternalLink className="h-3 w-3" />
                       </Link>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(scan.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        scan.preview?.overall >= 80 
                          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" 
                          : scan.preview?.overall >= 50 
                            ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20" 
                            : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20"
                      }
                      variant="outline"
                    >
                      {scan.preview?.overall || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium capitalize text-muted-foreground">
                      {scan.preview?.verdict || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary"
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
                        className="border-primary/20 hover:bg-primary/10 hover:text-primary"
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
    </motion.div>
  );
}

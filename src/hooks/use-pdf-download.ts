"use client";

import { useCallback, useState } from "react";

import { isApiError } from "@/lib/api/client";
import { downloadScanPdf } from "@/lib/api/scan";
import { generateAeoGeoReportPdf } from "@/lib/pdf/aeo-geo-report-pdf";
import { hostFromUrl } from "@/components/report/score-utils";
import type { AuditReport } from "@/types/audit";

const PENDING_RETRIES = 10;
const PENDING_DELAY_MS = 3000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function usePdfDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (
    publicId: string,
    url: string,
    report?: AuditReport | null
  ) => {
    setIsDownloading(true);
    setExhausted(false);
    setError(null);

    try {
      if (report) {
        await generateAeoGeoReportPdf(report);
        return;
      }

      let blob: Blob | null = null;
      for (let attempt = 0; attempt < PENDING_RETRIES; attempt += 1) {
        try {
          blob = await downloadScanPdf(publicId);
          break;
        } catch (err) {
          if (isApiError(err) && err.status === 409 && err.code === "REPORT_PENDING") {
            setIsPreparing(true);
            if (attempt === PENDING_RETRIES - 1) {
              setExhausted(true);
              setError("Preparing your report…");
              return;
            }
            await sleep(PENDING_DELAY_MS);
            continue;
          }
          throw err;
        }
      }

      if (!blob) return;

      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `aeo-geo-report-${hostFromUrl(url)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download PDF.");
    } finally {
      setIsPreparing(false);
      setIsDownloading(false);
    }
  }, []);

  return { download, isDownloading, isPreparing, exhausted, error };
}

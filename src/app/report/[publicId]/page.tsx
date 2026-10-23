import type { Metadata } from "next";

import { noindexMetadataFor } from "@/components/seo/noindex";
import ScannerClient from "@/app/scanner/scanner-client";

export const metadata: Metadata = noindexMetadataFor("/report");

export default async function ReportPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  return (
    <ScannerClient initialPublicId={publicId} />
  );
}

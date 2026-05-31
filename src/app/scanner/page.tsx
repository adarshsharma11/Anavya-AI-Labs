import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import ScannerClient from "./scanner-client";
import { ScannerSeoSections } from "./scanner-seo-sections";
import { ScannerStructuredData } from "./scanner-structured-data";

export const metadata: Metadata = MetaHead(pageMetadata.scanner);

export default async function ScannerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : undefined;

  if (tab === "competitor") {
    const nextParams = new URLSearchParams();
    const id = typeof params.id === "string" ? params.id : undefined;
    const scanId = typeof params.scanId === "string" ? params.scanId : undefined;
    const competitorReportTab =
      typeof params.competitorReportTab === "string"
        ? params.competitorReportTab
        : undefined;

    if (id) nextParams.set("id", id);
    if (scanId) nextParams.set("scanId", scanId);
    if (competitorReportTab) {
      nextParams.set("competitorReportTab", competitorReportTab);
    }

    const query = nextParams.toString();
    redirect(query ? `/competitor-scanner?${query}` : "/competitor-scanner");
  }

  return (
    <>
      <ScannerStructuredData variant="website" />
      <ScannerClient />
      <section className="container pb-16 md:pb-24">
        <ScannerSeoSections variant="website" />
      </section>
    </>
  );
}

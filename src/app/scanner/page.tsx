import type { Metadata } from "next";
import { pageMetadata } from "@/config/site";
import { MetaHead } from "@/components/seo/meta-head";
import ScannerClient from './scanner-client';

export const metadata: Metadata = MetaHead(pageMetadata.scanner);

export default function ScannerPage() {
  return <ScannerClient />;
}

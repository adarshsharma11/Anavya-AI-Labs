import { createPageMetadata, pageMetadata } from "@/config/site";
import ContactClient from "./contact-client";

export const metadata = createPageMetadata(pageMetadata.contact);

export default function ContactPage() {
  return <ContactClient />;
}

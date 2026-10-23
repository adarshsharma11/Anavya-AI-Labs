"use client";

import { PolicyLayout } from "@/components/layout/policy-layout";

const content = `Thank you for using Anavya AI Labs. This page explains how billing and refunds work for the website scanner.

What you pay for:
The first scan preview is free. A full report is unlocked with a one-time payment for that scan, processed by Razorpay. There is no monthly subscription and no recurring charge.

Refunds:
Because the full report is a digital deliverable that is shown immediately after payment, we do not offer refunds for completed unlocks. If a payment succeeded but the report did not load, email support@anavyaailabs.com with the scan URL or payment reference. We will restore access or refund that charge if we cannot deliver the report.

Cancellations:
There is no subscription to cancel. An unlocked report stays available for 30 days, as described in the Terms of Service.

Emails:
If you give us an email address so you can reopen a report, we may use it for that report and for product updates. You can ask us to delete it by writing to support@anavyaailabs.com.

Changes:
We may update this policy. The version on this page is the current one. Questions: support@anavyaailabs.com.`;

export default function RefundPolicyClient() {
  return <PolicyLayout title="Refund Policy" rawContent={content} />;
}

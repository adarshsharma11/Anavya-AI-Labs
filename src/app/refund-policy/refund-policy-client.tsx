"use client";

import { PolicyLayout } from "@/components/layout/policy-layout";

const content = `1. Our Refund Policy Philosophy
At [Your Company Name], we strive to provide immediate, high-quality, actionable insights through our automated website audit reports. Because our premium reports are digitally delivered and instantly generated using intensive AI and server resources, our standard policy is that all payments for report unlocks are non-refundable once the full report has been successfully generated and delivered to your screen or email.

2. Eligibility for Exceptions
We understand that technical issues can occasionally occur. Therefore, we will gladly issue a full refund under the following strict conditions:
- Delivery Failure: Your payment was successfully processed by Razorpay, but the full premium report was never delivered or generated due to a verified technical error or downtime on our servers.
- Duplicate Billing: You were accidentally charged multiple times for the exact same report instance due to a payment gateway glitch.

Please note: We do NOT offer refunds if you simply disagree with the AI's suggestions, if you expected a different type of data, or if you accidentally scanned the wrong URL. We encourage you to carefully review the free preview metrics before deciding to unlock the full report.

3. How to Request a Refund
If you believe you meet the criteria for an exception, please follow these steps:
- Send an email to [email] within 7 days of your original payment date.
- Include your official Transaction ID (which can be found in your Razorpay email receipt).
- Provide a brief explanation of the issue (e.g., "Report failed to load after payment").
Our support team will investigate the server logs and payment records, and we commit to responding to your request within 2 business days.

4. Taxes and GST
All prices listed on our platform are final and inclusive of 18% GST (Goods and Services Tax) as required by Indian law. Official GST invoices are generated for every successful transaction and are available upon request by contacting our support team.

5. Contact Information
For any billing inquiries, payment failures, or refund requests, please reach out to us directly at [email].`;

export default function RefundPolicyClient() {
  return <PolicyLayout title="Refund Policy" rawContent={content} />;
}

"use client";

import { PolicyLayout } from "@/components/layout/policy-layout";

const content = `Thank you for choosing [Your Company Name]. We appreciate your business and strive to provide you with the best experience possible. We understand that it is important to have a clear understanding of our billing and refund policies, so we have provided the following information for your convenience.

Billing:
By using our product, you agree to pay the monthly fee for access to our platform. We reserve the right to change our pricing, pricing policies, features, and access restrictions at any time. If we do make any changes, we will notify you via email or through our website.

Refunds:
Due to the nature of our product, we currently do not offer refunds, either partial or in full. We believe that our product provides value to our customers, and we stand behind our commitment to quality. However, if you have any concerns or issues with our product, please do not hesitate to contact our customer support team. We will do our best to address your concerns and provide you with a satisfactory resolution.

Cancellation:
You can easily cancel your subscription at any time by logging into your account and following the cancellation process. Once you cancel your subscription, we will no longer charge you anything. Please note that if you cancel your subscription, you will lose access to our platform and all of its features.

Emails:
We may use your email to contact you about your account, product updates, and other marketing activities. You can unsubscribe from these emails at any time by clicking the \"unsubscribe\" link at the bottom of any email.

Conditions:
We reserve the right to change or amend our policy at any time. By continuing to use our platform, you agree to these terms and conditions. If you have any questions or concerns about our policy, please contact our customer support team at [email].

Thank you for choosing our product.`;

export default function RefundPolicyClient() {
  return <PolicyLayout title="Refund Policy" rawContent={content} />;
}

"use client";

import { PolicyLayout } from "@/components/layout/policy-layout";

const content = `1. Who we are
[Your Company Name] operates the advanced AI-powered website audit and analysis platform available at [your domain]. Our platform helps businesses, developers, and marketers identify performance bottlenecks, SEO issues, accessibility gaps, and security vulnerabilities to improve their digital presence. For any privacy-related questions or concerns, you can contact our Data Protection Officer at [email].

2. What information we collect
To provide our auditing services effectively, we collect the following types of information:
- Provided Data: The URLs you submit for scanning and analysis.
- Contact Information: Your email address (which is optional for free scans but required when unlocking a full premium report, so we can send you the access link).
- Payment Information: When purchasing a full report, payment details are processed securely by our payment gateway partner, Razorpay. We never store or process your credit card details or bank information on our servers.
- Usage Data: We collect analytics regarding how you use our platform (such as pages visited, types of scans performed, browser type, and device information) to help us improve the user experience.

3. How we use your information
We use the collected data for the following essential purposes:
- Service Delivery: To run automated and AI-driven website and competitor scans, calculate performance scores, and generate actionable reports.
- Communication: To securely deliver your purchased report access link via email and provide customer support when requested.
- Payment Processing: To securely facilitate one-time payments through Razorpay for unlocking premium AI-generated reports.
- Platform Improvement: To analyze usage trends, fix bugs, and continuously enhance the accuracy and features of our auditing engine.

4. Who we share your data with
We respect your privacy and only share data with trusted third parties necessary to operate our service:
- Payment Processors: Razorpay, strictly for handling secure transaction processing.
- Analytics Providers: Tools like Google Analytics or Posthog to understand website traffic and user behavior.
- AI Providers: We securely transmit sanitized scrape data to our LLM partners solely for the purpose of generating your customized technical analysis.
- We firmly state that we do not sell, rent, or trade your personal data to third parties under any circumstances.

5. Data retention and security
- Scan Data: Generated scan results and reports are retained in our database for 30 days to allow you continued access via your unique link. After 30 days, they are permanently deleted.
- Email Addresses: Your email address is securely retained in our system so you can access your past unlocked reports, until you explicitly request deletion.
- Security Measures: All data transfers are encrypted in transit via SSL/TLS. We implement strict access controls to protect your information from unauthorized access.

6. Your rights and choices
You have the right to access, update, or request the deletion of your personal data at any time. You can request a complete deletion of your email and associated scan history by contacting us directly at [email]. We will process your request within 7 business days.

7. Cookies and Tracking
We use cookies strictly for session management, security, and basic analytics. These cookies help us understand how you interact with our platform and ensure a seamless experience. You can manage or disable non-essential cookies directly within your browser settings.

8. Changes to this policy
We may update this Privacy Policy periodically to reflect changes in our platform features, legal requirements, or data processing practices. We encourage you to review this page occasionally. Your continued use of the platform after any changes indicates your acceptance of the updated policy.`;

export default function PrivacyClient() {
  return <PolicyLayout title="Privacy Policy" rawContent={content} />;
}

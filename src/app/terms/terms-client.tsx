"use client";

import { PolicyLayout } from "@/components/layout/policy-layout";

const content = `1. Acceptance of Terms
By accessing or using the website auditing platform located at [your domain], you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our services.

2. Description of Service
[Your Company Name] provides an automated, AI-assisted platform that analyzes websites for performance metrics, SEO optimization, accessibility standards, and basic security configurations. The service generates comprehensive reports containing technical analysis and actionable insights. Our findings are generated using automated scraping tools and AI models, and are provided strictly for informational and educational purposes.

3. Acceptable Use and Restrictions
To ensure a safe and reliable environment for all users, you agree to the following conditions:
- Authorization: You may only submit URLs for websites that you personally own, manage, or have explicit permission to audit. 
- No Malicious Use: You may not use our platform to scan competitor infrastructure for the purpose of finding exploits, performing DDoS attacks, or any other malicious intent.
- No Abuse: You agree not to reverse engineer our auditing engine, scrape our API endpoints, bypass our rate limits, or otherwise abuse the platform's infrastructure.

4. Premium Reports and Payments
While basic preview scans are provided for free, detailed AI-generated reports are locked behind a paywall.
- All payments are securely processed by our partner, Razorpay.
- A one-time payment grants you access to unlock the full, comprehensive report for a specific scanned URL.
- Once unlocked, your report will be accessible via your unique URL link for a period of 30 days, after which it will be purged from our systems.

5. Disclaimers and Limitations of Liability
- Accuracy: While we strive for high precision, our audit results and AI suggestions are fully automated and may not be 100% accurate or complete. You should independently verify any critical technical changes before applying them to your production website.
- Liability: [Your Company Name] shall not be held liable for any business decisions, financial losses, traffic drops, or technical issues that result from implementing the suggestions found in our reports.
- Availability: We provide the service on an "as-is" and "as-available" basis. We do not guarantee 100% uptime, uninterrupted access, or error-free operation.

6. Intellectual Property Rights
All original content, branding, UI design, custom code, and the proprietary structure of the AI-generated recommendations provided on this platform are the exclusive property of [Your Company Name]. You may use the generated reports for your internal business purposes, but you may not reproduce, resell, or distribute our platform's UI or core technology.

7. Governing Law and Dispute Resolution
These Terms of Service, and any disputes arising from them, shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.

8. Contact Information
If you have any questions regarding these terms, please contact our support team at [email].`;

export default function TermsClient() {
  return <PolicyLayout title="Terms of Service" rawContent={content} />;
}

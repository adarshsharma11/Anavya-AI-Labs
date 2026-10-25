import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const PRICING_FAQ = [
  {
    question: "How do daily scan limits work?",
    answer:
      "Each plan includes a daily scan allowance. When you reach it, the scanner tells you the plan and the limit.",
  },
  {
    question: "Which currency are prices in?",
    answer: "Plan prices are shown in US dollars.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. A paid plan stays active until the current period ends, and the billing page shows the cancellation date.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Checkout is powered by Razorpay: UPI, cards, netbanking, and wallets.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "See the refund policy for eligibility and timelines.",
  },
] as const;

export function PricingFaq() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
      <Accordion type="single" collapsible className="mt-4">
        {PRICING_FAQ.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              {item.question === "What is your refund policy?" ? (
                <span>
                  See the{" "}
                  <Link href="/refund-policy" className="font-medium text-primary underline-offset-4 hover:underline">
                    refund policy
                  </Link>{" "}
                  for eligibility and timelines.
                </span>
              ) : (
                item.answer
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

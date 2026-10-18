import { createPageMetadata, pageMetadata } from "@/config/site";
import { CtaSection } from "@/components/sections/home/cta-section";
import { HeroSection } from "@/components/sections/home/hero-section";
import { HowItWorksSection } from "@/components/sections/home/how-it-works-section";
import { SalesScrollSection } from "@/components/sections/home/sales-scroll-section";

export const metadata = createPageMetadata(pageMetadata.home);

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <SalesScrollSection />
      <HowItWorksSection />
      <CtaSection />
    </div>
  );
}

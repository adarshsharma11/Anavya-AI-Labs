import { CtaSection } from '@/components/sections/home/cta-section';
import { FeedbackSection } from '@/components/sections/home/feedback-section';
import { FeaturesSection } from '@/components/sections/home/features-section';
import { HeroSection } from '@/components/sections/home/hero-section';
import { HowItWorksSection } from '@/components/sections/home/how-it-works-section';
import { TrustLogosSection } from '@/components/sections/home/trust-logos-section';

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrustLogosSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FeedbackSection />
      <CtaSection />
    </div>
  );
}

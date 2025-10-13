'use client';

import { BaseLayout } from '@/components/layout/BaseLayout';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';


export default function Home() {
  return (
    <BaseLayout>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </BaseLayout>
  );
}

import React from 'react';
import LandingPricingSection from '../components/landing/LandingPricingSection';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Pricing & Subscription Plans | Edulpha" description="Affordable access plans for individual students, teachers, and school licenses across Africa." />
      <Navbar />

      <div className="pt-20">
        <LandingPricingSection />
      </div>

      <DynamicFooter />
    </div>
  );
}

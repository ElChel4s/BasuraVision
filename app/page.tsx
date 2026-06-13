import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import ArchitectureSection from '@/components/landing/ArchitectureSection';
import CodeSection from '@/components/landing/CodeSection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 selection:bg-emerald-900 selection:text-white">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <ArchitectureSection />
      <CodeSection />
      <Footer />
    </div>
  );
}

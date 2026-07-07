import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { HowItWorks } from '../components/sections/HowItWorks';
import { FeatureGrid } from '../components/sections/FeatureGrid'; 
import { CTASection } from '../components/sections/CTASection';

export const metadata = {
  title: 'DrawApp - Real-Time Collaborative Whiteboard',
  description: 'DrawApp is a real-time collaborative whiteboard for teams to sketch, brainstorm, and bring ideas to life — together, instantly.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <FeatureGrid /> 
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

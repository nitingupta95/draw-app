import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { FeatureGrid } from '../components/sections/FeatureGrid';
import { ArchitectureDiagram } from '../components/sections/ArchitectureDiagram';
import { ProjectStructure } from '../components/sections/ProjectStructure';
import { TechStack } from '../components/sections/TechStack';
import { GettingStarted } from '../components/sections/GettingStarted';
import { CTASection } from '../components/sections/CTASection';

export const metadata = {
  title: 'Draw App - Collaborative Whiteboard',
  description: 'Sketch, brainstorm, and design together — instantly.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeatureGrid />
        <ArchitectureDiagram />
        <ProjectStructure />
        <TechStack />
        <GettingStarted />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

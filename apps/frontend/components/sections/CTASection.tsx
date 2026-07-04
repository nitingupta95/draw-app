"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-12 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="cta-gradient px-8 py-16 md:px-16 md:py-20 text-center relative">
            {/* Decorative sparkles */}
            <div className="absolute top-8 left-12 text-white/40 animate-pulse-soft">✦</div>
            <div className="absolute top-16 right-16 text-white/30 animate-pulse-soft" style={{ animationDelay: '1s' }}>✦</div>
            <div className="absolute bottom-12 left-20 text-white/20 animate-pulse-soft" style={{ animationDelay: '2s' }}>✦</div>
            <div className="absolute bottom-8 right-24 text-white/40 animate-pulse-soft" style={{ animationDelay: '0.5s' }}>✦</div>

            {/* Wave decorations */}
            <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
              <path d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,40 L1440,120 L0,120 Z" fill="rgba(108,92,231,0.2)"/>
              <path d="M0,60 C300,20 600,100 900,40 C1100,0 1300,80 1440,60 L1440,120 L0,120 Z" fill="rgba(162,155,254,0.15)"/>
            </svg>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/30 backdrop-blur-sm text-sm font-semibold text-primary mb-6">
              Ready to get started?
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Start drawing with your team today
            </h2>

            <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
              Create your first room in seconds. No setup. No credit card.
            </p>
            
            <Link 
              href="/signin" 
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-glow-md hover:shadow-glow-lg hover:bg-primary-dark transition-all hover:scale-105"
            >
              Start for Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

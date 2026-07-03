"use client";

import React from 'react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-foreground">
          Ready to start drawing?
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Spin up your own server in minutes, or try the hosted demo right now. No credit card required.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/signin" 
            className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-primary px-10 py-5 text-lg font-bold text-primary-foreground shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1"
          >
            Start a free board
          </Link>
          <Link 
            href="https://github.com" 
            target="_blank"
            className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-background px-10 py-5 text-lg font-bold text-foreground border border-white/20 hover:bg-white/5 transition-all"
          >
            Clone the repo
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden">
      {/* Subtle hand-drawn SVG background motif */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <motion.path 
            d="M 100 200 Q 300 50, 500 300 T 900 100" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.rect 
            x="70%" y="40%" width="120" height="80" rx="10"
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.circle 
            cx="20%" cy="60%" r="50"
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, delay: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground">
            <span className="text-primary mr-2">v1.0 is live</span> 
            Real-time collaboration unlocked
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8">
            Sketch, brainstorm, and <br className="hidden md:block"/> design together — <span className="text-primary">instantly.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium">
            A real-time collaborative canvas with persistence. Built for teams who need to think out loud visually.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signin" 
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1"
            >
              Try the Demo
            </Link>
            <Link 
              href="https://github.com" 
              target="_blank"
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-xl bg-white/5 px-8 py-4 text-base font-bold text-foreground border border-white/10 hover:bg-white/10 transition-all"
            >
              View on GitHub
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

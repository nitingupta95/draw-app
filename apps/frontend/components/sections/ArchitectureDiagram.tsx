"use client";

import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { motion } from 'framer-motion';

export function ArchitectureDiagram() {
  return (
    <section id="architecture" className="py-24 bg-white/5 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading 
          title="Built for Scale" 
          subtitle="A modular, highly decoupled architecture using Turborepo to share code seamlessly across the stack."
        />
        
        <div className="mt-16 relative bg-[#0A0A0B] rounded-3xl p-8 border border-white/10 overflow-hidden shadow-2xl flex justify-center items-center">
          {/* A conceptual diagram using SVG and Tailwind classes */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full max-w-4xl mx-auto">
            
            {/* Frontend */}
            <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
              <div className="w-full rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-6 text-center shadow-lg relative z-10">
                <h4 className="font-bold text-xl mb-2 text-white">Next.js Frontend</h4>
                <p className="text-sm text-indigo-200">React 19, Canvas API</p>
              </div>
              <div className="h-12 md:h-auto md:w-16 w-0.5 md:h-0.5 bg-gradient-to-b md:bg-gradient-to-r from-indigo-500/50 to-emerald-500/50"></div>
            </div>

            {/* Backends */}
            <div className="flex flex-col gap-6 w-full md:w-1/3 z-10">
              <div className="w-full rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-6 text-center shadow-lg">
                <h4 className="font-bold text-xl mb-2 text-white">WS Backend</h4>
                <p className="text-sm text-emerald-200">Express, WebSockets</p>
              </div>
              <div className="w-full rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 p-6 text-center shadow-lg">
                <h4 className="font-bold text-xl mb-2 text-white">HTTP Backend</h4>
                <p className="text-sm text-emerald-200">Express, REST API</p>
              </div>
            </div>

            <div className="hidden md:flex flex-col gap-6 items-center w-16 z-0 -mx-16">
               <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500/50 to-blue-500/50"></div>
               <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500/50 to-blue-500/50"></div>
            </div>
            <div className="flex md:hidden h-12 w-0.5 bg-gradient-to-b from-emerald-500/50 to-blue-500/50 z-0"></div>

            {/* Database */}
            <div className="flex flex-col items-center gap-4 w-full md:w-1/3 z-10">
              <div className="w-full rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-6 text-center shadow-lg">
                <h4 className="font-bold text-xl mb-2 text-white">PostgreSQL</h4>
                <p className="text-sm text-blue-200">Prisma ORM</p>
              </div>
            </div>

          </div>

          {/* Shared packages indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-16 border-b-2 border-l-2 border-r-2 border-white/10 rounded-b-xl flex justify-center items-end pb-2 opacity-50 z-0">
             <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground bg-[#0A0A0B] px-4 -mb-2">Shared Packages: UI, DB, Common</span>
          </div>
        </div>
      </div>
    </section>
  );
}

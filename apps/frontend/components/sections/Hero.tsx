"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Database, Shield, Zap } from 'lucide-react';

const highlights = [
  { icon: Users, label: 'Real-Time Sync', desc: 'See changes instantly as your team draws together.' },
  { icon: Database, label: 'Persistent Storage', desc: 'All your drawings are auto-saved and securely stored.' },
  { icon: Shield, label: 'Secure & Private', desc: 'JWT authentication & room-based access for your team.' },
  { icon: Zap, label: 'Powerful Tools', desc: 'Everything you need to create, collaborate, and innovate.' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col pt-24 overflow-hidden">
      {/* Background glow effects */}
      <div className="glow-orb glow-orb-purple w-[600px] h-[600px] -top-40 -right-40 opacity-40" />
      <div className="glow-orb glow-orb-blue w-[400px] h-[400px] top-20 -left-20 opacity-30" />
      <div className="glow-orb glow-orb-purple w-[300px] h-[300px] bottom-40 right-20 opacity-20" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex-grow flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap size={14} className="text-primary" />
            <span className="text-sm font-semibold text-primary">REAL-TIME COLLABORATION</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
            Draw, Collaborate,{' '}
            <br className="hidden md:block" />
            Create{' '}
            <span className="gradient-text">Together</span>
            {' '}in Real-Time.
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            DrawApp is a real-time collaborative whiteboard for teams to sketch, brainstorm, 
            and bring ideas to life — together, instantly.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="#how-it-works" 
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-foreground border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Watch Demo
            </Link>
            <Link 
              href="/signin" 
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-glow-sm hover:shadow-glow-md hover:bg-primary-dark transition-all hover:scale-105"
            >
              Start Drawing Now
            </Link>
          </div>
        </motion.div>

        {/* Whiteboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 w-full max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-card-border bg-white">
            {/* Mockup Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                <span className="text-sm font-medium text-muted-foreground">Product Roadmap</span>
                <span className="text-muted-foreground/50">•••</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4l2 2"/></svg>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                {/* Avatar stack */}
                <div className="flex -space-x-2 ml-2">
                  <div className="w-7 h-7 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-700">A</div>
                  <div className="w-7 h-7 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700">J</div>
                  <div className="w-7 h-7 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-green-700">M</div>
                  <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">+4</div>
                </div>
                <button className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Share
                </button>
              </div>
            </div>

            {/* Mockup Canvas */}
            <div className="relative h-[320px] md:h-[400px] bg-white p-6">
              {/* Toolbar left */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 bg-white rounded-xl shadow-card p-2 border border-gray-100">
                {['M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586', 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z', 'M3 3h18v18H3z', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z', 'M5 3l14 9-14 9V3z', 'M4 7V4h16v3 M9 20h6 M12 4v16'].map((d, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-50'} transition-colors cursor-pointer`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={d} />
                    </svg>
                  </div>
                ))}
              </div>

              {/* Canvas shapes */}
              <svg className="w-full h-full" viewBox="0 0 800 350" fill="none">
                {/* Ideas box */}
                <rect x="100" y="120" width="120" height="70" rx="12" fill="#E8E5FF" stroke="#6C5CE7" strokeWidth="2"/>
                <text x="160" y="162" textAnchor="middle" className="text-sm font-semibold" fill="#6C5CE7">Ideas</text>
                
                {/* Arrow 1 */}
                <path d="M225 155 L275 155" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                
                {/* Plan circle */}
                <circle cx="340" cy="155" r="50" fill="#D5F5E3" stroke="#00B894" strokeWidth="2"/>
                <text x="340" y="162" textAnchor="middle" className="text-sm font-semibold" fill="#00B894">Plan</text>
                
                {/* Arrow 2 */}
                <path d="M395 155 L445 155" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                
                {/* Design diamond */}
                <polygon points="520,105 580,155 520,205 460,155" fill="#FFE0E6" stroke="#E84393" strokeWidth="2"/>
                <text x="520" y="162" textAnchor="middle" className="text-sm font-semibold" fill="#E84393">Design</text>
                
                {/* Arrow 3 */}
                <path d="M585 155 L635 155" stroke="#9CA3AF" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                
                {/* Build box */}
                <rect x="640" y="120" width="120" height="70" rx="12" fill="#E0F2FE" stroke="#0984E3" strokeWidth="2"/>
                <text x="700" y="162" textAnchor="middle" className="text-sm font-semibold" fill="#0984E3">Build</text>
                
                {/* Sticky notes */}
                <rect x="300" y="240" width="100" height="80" rx="6" fill="#FFEAA7" stroke="#FDCB6E" strokeWidth="1.5" transform="rotate(-3 350 280)"/>
                <text x="350" y="275" textAnchor="middle" className="text-xs" fill="#B7950B">Add user</text>
                <text x="350" y="292" textAnchor="middle" className="text-xs" fill="#B7950B">feedback</text>
                
                <rect x="550" y="240" width="100" height="80" rx="6" fill="#DFE6E9" stroke="#B2BEC3" strokeWidth="1.5" transform="rotate(2 600 280)"/>
                <text x="600" y="280" textAnchor="middle" className="text-xs" fill="#636E72">Launch!</text>
                
                {/* Cursor labels */}
                <g>
                  <rect x="130" y="90" width="42" height="20" rx="10" fill="#00B894"/>
                  <text x="151" y="104" textAnchor="middle" className="text-[9px] font-bold" fill="white">Alice</text>
                  <circle cx="130" cy="100" r="3" fill="#00B894"/>
                </g>
                <g>
                  <rect x="505" y="80" width="38" height="20" rx="10" fill="#0984E3"/>
                  <text x="524" y="94" textAnchor="middle" className="text-[9px] font-bold" fill="white">John</text>
                  <circle cx="505" cy="90" r="3" fill="#0984E3"/>
                </g>
                <g>
                  <rect x="465" y="275" width="38" height="20" rx="10" fill="#E84393"/>
                  <text x="484" y="289" textAnchor="middle" className="text-[9px] font-bold" fill="white">Mike</text>
                  <circle cx="465" cy="285" r="3" fill="#E84393"/>
                </g>

                {/* Share Room panel hint */}
                <rect x="660" y="45" width="130" height="100" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
                <text x="725" y="65" textAnchor="middle" className="text-[10px] font-bold" fill="#1A1A2E">Share Room</text>
                <text x="725" y="80" textAnchor="middle" className="text-[8px]" fill="#9CA3AF">Invite people to collaborate</text>
                <rect x="672" y="90" width="106" height="18" rx="4" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1"/>
                <text x="725" y="103" textAnchor="middle" className="text-[7px]" fill="#9CA3AF">team@drawapp.com</text>
                <rect x="672" y="115" width="106" height="22" rx="6" fill="#6C5CE7"/>
                <text x="725" y="130" textAnchor="middle" className="text-[8px] font-bold" fill="white">Copy Room Link</text>

                {/* Arrow marker */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
                  </marker>
                </defs>
              </svg>

              {/* Bottom toolbar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white rounded-xl shadow-card px-3 py-2 border border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">—</span>
                  <span className="text-xs font-medium text-foreground">100%</span>
                  <span className="text-xs text-muted-foreground">+</span>
                </div>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Highlights Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="max-w-7xl mx-auto px-6 pb-16 pt-8 w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{item.label}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

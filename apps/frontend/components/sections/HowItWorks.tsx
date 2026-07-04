"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, PenTool, Zap, Cloud, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: '1. Create or Join a Room',
    desc: 'Create a new room or join with an invite link.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: PenTool,
    title: '2. Start Drawing',
    desc: 'Use powerful tools to sketch, write, and ideate together.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Zap,
    title: '3. See Changes Live',
    desc: 'Every change is synced in real time for everyone.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Cloud,
    title: '4. Saved Automatically',
    desc: 'All your work is securely saved in the cloud.',
    color: 'bg-purple-100 text-purple-600',
  },
];

const collabFeatures = [
  'Real-time cursors',
  'Live shape & text sync',
  'Presence indicators',
  'Smooth & instant updates',
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-background relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="pattern-overlay absolute inset-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-sm font-semibold text-primary mb-3 tracking-wide">Simple & Fast</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            How Draw App Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get your team on the same canvas in seconds.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                {/* Connector arrow (not on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-4 z-10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                      <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5 shadow-sm`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Live Collaboration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Whiteboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-2xl shadow-card border border-card-border bg-white overflow-hidden">
              {/* Mockup Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground ml-2">Product Roadmap</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white text-[8px] font-bold text-purple-700 flex items-center justify-center">A</div>
                    <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white text-[8px] font-bold text-blue-700 flex items-center justify-center">J</div>
                    <div className="w-6 h-6 rounded-full bg-green-200 border-2 border-white text-[8px] font-bold text-green-700 flex items-center justify-center">M</div>
                  </div>
                  <span className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded font-semibold">Share</span>
                </div>
              </div>

              {/* Canvas content */}
              <div className="p-6 h-[300px] md:h-[380px] relative bg-white">
                <svg className="w-full h-full" viewBox="0 0 500 320" fill="none">
                  {/* Q1 Research */}
                  <rect x="60" y="80" width="110" height="70" rx="10" fill="#E8E5FF" stroke="#C4B5FD" strokeWidth="1.5"/>
                  <text x="115" y="110" textAnchor="middle" className="text-[11px] font-bold" fill="#6C5CE7">Q1</text>
                  <text x="115" y="128" textAnchor="middle" className="text-[10px]" fill="#7C6FE4">Research</text>

                  {/* Q2 MVP Launch */}
                  <rect x="140" y="170" width="130" height="75" rx="10" fill="#FFEAA7" stroke="#FDCB6E" strokeWidth="1.5"/>
                  <text x="205" y="200" textAnchor="middle" className="text-[11px] font-bold" fill="#B7950B">Q2</text>
                  <text x="205" y="218" textAnchor="middle" className="text-[10px]" fill="#B7950B">MVP Launch</text>

                  {/* Q3 User Feedback */}
                  <rect x="280" y="90" width="120" height="65" rx="10" fill="#FFE0E6" stroke="#E84393" strokeWidth="1.5"/>
                  <text x="340" y="117" textAnchor="middle" className="text-[11px] font-bold" fill="#E84393">Q3</text>
                  <text x="340" y="135" textAnchor="middle" className="text-[10px]" fill="#E84393">User Feedback</text>

                  {/* Q4 Scale */}
                  <rect x="340" y="220" width="100" height="65" rx="10" fill="#D5F5E3" stroke="#00B894" strokeWidth="1.5"/>
                  <text x="390" y="248" textAnchor="middle" className="text-[11px] font-bold" fill="#00B894">Q4</text>
                  <text x="390" y="266" textAnchor="middle" className="text-[10px]" fill="#00B894">Scale</text>

                  {/* Arrows between sections */}
                  <path d="M170 145 C 190 165, 170 175, 180 175" stroke="#9CA3AF" strokeWidth="1.5" fill="none" markerEnd="url(#arrowH)"/>
                  <path d="M270 200 L 280 150" stroke="#9CA3AF" strokeWidth="1.5" fill="none" markerEnd="url(#arrowH)"/>
                  <path d="M370 155 L 380 220" stroke="#9CA3AF" strokeWidth="1.5" fill="none" markerEnd="url(#arrowH)"/>

                  {/* Focus text */}
                  <text x="55" y="210" className="text-[13px] italic" fill="#6B7280">Focus!</text>
                  <path d="M90 210 C 100 220, 100 225, 135 190" stroke="#6B7280" strokeWidth="1.5" fill="none" strokeDasharray="4,3" markerEnd="url(#arrowH)"/>

                  {/* Star doodle */}
                  <polygon points="320,175 325,185 335,185 327,192 330,202 320,196 310,202 313,192 305,185 315,185" fill="none" stroke="#FDCB6E" strokeWidth="1.5"/>

                  <defs>
                    <marker id="arrowH" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
                    </marker>
                  </defs>
                </svg>
              </div>

              {/* Bottom toolbar */}
              <div className="flex items-center justify-center gap-3 py-3 border-t border-gray-100 bg-gray-50">
                {['✏️', '🖊️', '⭕', '↩️', '↪️'].map((e, i) => (
                  <span key={i} className="text-sm cursor-pointer">{e}</span>
                ))}
                <div className="flex gap-1 ml-2">
                  <div className="w-5 h-5 rounded-full bg-foreground" />
                  <div className="w-5 h-5 rounded-full bg-primary" />
                  <div className="w-5 h-5 rounded-full bg-blue-500" />
                  <div className="w-5 h-5 rounded-full bg-yellow-400" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-sm font-semibold text-primary mb-3 tracking-wide">Live Collaboration</span>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-6">
              See your team in action
            </h3>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Watch your team draw, edit and brainstorm together in real time. No refresh. No lag.
            </p>
            <ul className="space-y-4">
              {collabFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-base font-medium text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

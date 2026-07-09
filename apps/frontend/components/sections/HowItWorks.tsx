"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, PenTool, Zap, Cloud, CheckCircle2 } from 'lucide-react';
import { StepCard } from './how-it-works/StepCard';
import { MockupCanvas } from './how-it-works/MockupCanvas';

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
          <h2 className="font-display italic text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            How Draw App Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Get your team on the same canvas in seconds.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              desc={step.desc}
              color={step.color}
              index={index}
              totalSteps={steps.length}
            />
          ))}
        </div>

        {/* Live Collaboration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Whiteboard Mockup */}
          <MockupCanvas />

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-sm font-semibold text-primary mb-3 tracking-wide">Live Collaboration</span>
            <h3 className="font-display italic text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
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

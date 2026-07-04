"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, PenTool, Cloud, LayoutGrid, Shield, History, Monitor, Share2 } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Real-time Collaboration',
    desc: 'See every stroke, shape, and change in real time. Work together seamlessly.',
    color: 'bg-purple-50 text-purple-500',
  },
  {
    icon: PenTool,
    title: 'Multiple Drawing Tools',
    desc: 'Rectangle, Circle, Diamond, Pencil, Arrow, Text, Image and more.',
    color: 'bg-pink-50 text-pink-500',
  },
  {
    icon: Cloud,
    title: 'Persistent & Reliable',
    desc: 'All your drawings are saved automatically and securely in the cloud.',
    color: 'bg-blue-50 text-blue-500',
  },
  {
    icon: LayoutGrid,
    title: 'Multi-room Support',
    desc: 'Create or join unlimited rooms for different teams or projects.',
    color: 'bg-red-50 text-red-500',
  },
  {
    icon: Shield,
    title: 'JWT Secure',
    desc: 'Secure authentication and authorized real-time connections.',
    color: 'bg-green-50 text-green-500',
  },
  {
    icon: History,
    title: 'Undo / Redo',
    desc: 'Easily undo or redo your actions. Never lose an idea.',
    color: 'bg-orange-50 text-orange-500',
  },
  {
    icon: Monitor,
    title: 'Cross Platform',
    desc: 'Works perfectly on desktop, tablet, and mobile browsers.',
    color: 'bg-cyan-50 text-cyan-500',
  },
  {
    icon: Share2,
    title: 'Export & Share',
    desc: 'Export your whiteboard and share it with your team instantly.',
    color: 'bg-rose-50 text-rose-500',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-16 bg-muted/50 relative overflow-hidden">
      {/* Background glow */}
      <div className="glow-orb glow-orb-purple w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 opacity-20" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-sm font-semibold text-primary mb-3 tracking-wide">Everything you need</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Powerful features for modern teams
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our whiteboard is built for creativity, collaboration, and productivity.
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover border border-card-border/60 transition-all duration-300 h-full group hover:-translate-y-1">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

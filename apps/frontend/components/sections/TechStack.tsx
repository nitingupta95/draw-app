"use client";

import React from 'react';
import { TECH_STACK } from '../../lib/constants';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';

export function TechStack() {
  const frontend = TECH_STACK.filter(t => t.category === 'Frontend');
  const backend = TECH_STACK.filter(t => t.category === 'Backend');
  const devops = TECH_STACK.filter(t => t.category === 'DevOps');

  return (
    <section id="tech-stack" className="py-24 bg-white/5 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading 
          title="Modern Tech Stack" 
          subtitle="No compromises. Built with the best tools in the ecosystem."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:border-primary/30 transition-colors">
            <h3 className="font-bold text-xl mb-6 text-primary">Frontend</h3>
            <ul className="space-y-4">
              {frontend.map(item => (
                <li key={item.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium text-foreground">{item.name}</span>
                </li>
              ))}
            </ul>
          </Card>
          
          <Card className="hover:border-emerald-500/30 transition-colors">
            <h3 className="font-bold text-xl mb-6 text-emerald-500">Backend</h3>
            <ul className="space-y-4">
              {backend.map(item => (
                <li key={item.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-foreground">{item.name}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="hover:border-blue-500/30 transition-colors">
            <h3 className="font-bold text-xl mb-6 text-blue-500">DevOps & Tooling</h3>
            <ul className="space-y-4">
              {devops.map(item => (
                <li key={item.name} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-medium text-foreground">{item.name}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}

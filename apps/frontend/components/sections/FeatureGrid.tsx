"use client";

import React from 'react';
import { FEATURES } from '../../lib/constants';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SectionHeading } from '../ui/SectionHeading';
import { motion } from 'framer-motion';

export function FeatureGrid() {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading 
          title="Everything you need to build ideas" 
          subtitle="A fully-featured collaborative workspace designed for speed and reliability."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col group hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 text-primary group-hover:bg-primary/10 transition-colors">
                      <Icon size={24} />
                    </div>
                    {feature.isComingSoon && (
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        Coming soon
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

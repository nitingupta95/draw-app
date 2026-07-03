"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Draw App transformed the way our team brainstorms. Real-time sync is incredibly smooth!",
    name: "Alex Johnson",
    role: "Product Designer",
    avatar: "AJ",
    avatarBg: "bg-purple-200 text-purple-700",
  },
  {
    quote: "Finally, a whiteboard that's fast, reliable, and simple to use. Exactly what we needed.",
    name: "Sarah Williams",
    role: "Engineering Lead",
    avatar: "SW",
    avatarBg: "bg-teal-200 text-teal-700",
  },
  {
    quote: "The best part is how clean and intuitive everything feels. Our whole team uses it daily.",
    name: "Michael Chen",
    role: "Startup Founder",
    avatar: "MC",
    avatarBg: "bg-blue-200 text-blue-700",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-primary mb-3 tracking-wide">What users say</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Loved by creators and teams
          </h2>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white rounded-2xl p-7 shadow-card border border-card-border/60 hover:shadow-card-hover transition-all duration-300 h-full flex flex-col relative overflow-hidden">
                {/* Gradient top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary-light/40 to-primary/20" />
                
                {/* Quote mark */}
                <div className="text-3xl font-serif text-primary/30 mb-3 leading-none">&ldquo;&ldquo;</div>
                
                {/* Quote text */}
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Bottom quote mark */}
                <div className="text-xl font-serif text-primary/20 mb-4 leading-none">&rdquo;&rdquo;</div>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${testimonial.avatarBg} flex items-center justify-center text-sm font-bold`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StepCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  index: number;
  totalSteps: number;
}

export function StepCard({ icon: Icon, title, desc, color, index, totalSteps }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative text-center"
    >
      {/* Connector arrow (not on last item) */}
      {index < totalSteps - 1 && (
        <div className="hidden lg:block absolute top-10 -right-4 z-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300">
            <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5 shadow-sm`}>
        <Icon size={28} />
      </div>
      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{desc}</p>
    </motion.div>
  );
}

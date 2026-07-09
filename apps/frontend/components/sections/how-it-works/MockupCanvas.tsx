import React from 'react';
import { motion } from 'framer-motion';

export function MockupCanvas() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="rounded-2xl shadow-card border border-card-border bg-white overflow-hidden">
        {/* Mockup Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex gap-1 sm:gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground ml-1 sm:ml-2 truncate max-w-[80px] sm:max-w-none">Product Roadmap</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-purple-200 border-2 border-white text-[8px] font-bold text-purple-700 flex items-center justify-center">A</div>
              <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-white text-[8px] font-bold text-blue-700 flex items-center justify-center">J</div>
              <div className="w-6 h-6 rounded-full bg-green-200 border-2 border-white text-[8px] font-bold text-green-700 flex items-center justify-center">M</div>
            </div>
            <span className="text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded font-semibold">Share</span>
          </div>
        </div>

        {/* Canvas content */}
        <div className="p-3 sm:p-6 w-full aspect-video md:h-[380px] md:aspect-auto relative bg-white overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full max-h-full" viewBox="0 0 500 320" fill="none" preserveAspectRatio="xMidYMid meet">
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
        <div className="flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 border-t border-gray-100 bg-gray-50 overflow-x-auto px-2">
          {['✏️', '🖊️', '⭕', '↩️', '↪️'].map((e, i) => (
            <span key={i} className="text-xs sm:text-sm cursor-pointer flex-shrink-0">{e}</span>
          ))}
          <div className="flex gap-1 ml-1 sm:ml-2 flex-shrink-0">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-foreground" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-yellow-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { Users, Cloud, Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

const features = [
  { icon: Users, title: "Real-time Collaboration", desc: "See changes instantly as your team draws and brainstorms together." },
  { icon: Cloud,  title: "Persistent & Secure",   desc: "All your boards are saved automatically and securely in the cloud." },
  { icon: Zap,   title: "Powerful & Easy to Use", desc: "Beautiful tools and a simple interface to fuel your creativity." },
];

export function AuthLayout() {
  return (
    <div className="hidden lg:flex lg:w-[48%] bg-[#F5F4FF] border-r border-card-border flex-col px-10 py-8 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="glow-orb glow-orb-purple w-[400px] h-[400px] -top-10 -left-10 opacity-20 pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10 group w-fit">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-primary-foreground shadow-glow-sm group-hover:shadow-glow-md transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">Sketch Collab</span>
        </Link>

        {/* Content block */}
        <div className="flex-grow flex flex-col justify-center relative z-10 gap-5">
          {/* Tagline */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display italic text-3xl xl:text-4xl font-bold text-foreground leading-tight mb-2">
              Collaborate
              Create
              <span className="gradient-text"> Bring ideas</span> to life.
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              Real-time collaborative whiteboard for teams to brainstorm, sketch, and build together, anywhere, anytime.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white shadow-sm border border-card-border flex items-center justify-center">
                  <Icon size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Mini whiteboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl bg-white shadow-card border border-card-border overflow-hidden"
          >
            {/* Toolbar row */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-100">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {['A','J','P'].map((l,i)=>(
                    <div key={i} className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[7px] font-bold ${['bg-purple-200 text-purple-700','bg-teal-200 text-teal-700','bg-blue-200 text-blue-700'][i]}`}>{l}</div>
                  ))}
                </div>
                <span className="text-[8px] bg-primary text-white px-1.5 py-0.5 rounded font-bold">Share</span>
                <span className="text-gray-400 text-[10px]">›</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex">
              {/* Left toolbar */}
              <div className="flex flex-col gap-0.5 p-1 border-r border-gray-100 bg-white">
                {[0,1,2,3,4,5,6].map((i) => (
                  <div key={i} className={`w-5 h-5 rounded flex items-center justify-center ${i===0?'bg-primary/10':''}`}>
                    <div className={`w-2 h-2 rounded-sm ${i===0?'bg-primary/40':'bg-gray-300'}`} />
                  </div>
                ))}
              </div>

              {/* Drawing area */}
              <div className="flex-grow h-[130px] bg-white">
                <svg className="w-full h-full" viewBox="0 0 260 130" fill="none">
                  <rect x="10" y="8" width="72" height="46" rx="8" fill="#E8E5FF" stroke="#C4B5FD" strokeWidth="1.5"/>
                  <path d="M42 22 Q42 15 46 15 Q50 15 50 22 Q50 27 46 29 Q46 33 46 36" stroke="#6C5CE7" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <circle cx="46" cy="38" r="1.5" fill="#6C5CE7"/>
                  <text x="46" y="50" textAnchor="middle" fontSize="7" fill="#6C5CE7" fontWeight="bold">Brainstorm</text>

                  <circle cx="113" cy="32" r="24" stroke="#9CA3AF" strokeWidth="1.5" fill="none" strokeDasharray="4,3"/>

                  <rect x="152" y="6" width="72" height="46" rx="8" fill="#FFEAA7" stroke="#FDCB6E" strokeWidth="1.5"/>
                  <text x="188" y="22" textAnchor="middle" fontSize="7" fill="#B7950B" fontWeight="bold">User Flow</text>
                  <rect x="163" y="27" width="13" height="11" rx="2" fill="none" stroke="#B7950B" strokeWidth="1"/>
                  <rect x="181" y="27" width="13" height="11" rx="2" fill="none" stroke="#B7950B" strokeWidth="1"/>
                  <path d="M176 33 L181 33" stroke="#B7950B" strokeWidth="1" markerEnd="url(#aAP2)"/>

                  <rect x="10" y="72" width="65" height="42" rx="6" fill="none" stroke="#9CA3AF" strokeWidth="1.5"/>

                  <rect x="96" y="70" width="72" height="50" rx="8" fill="#FFD6EC" stroke="#E84393" strokeWidth="1.5"/>
                  <text x="132" y="90" textAnchor="middle" fontSize="7.5" fill="#E84393" fontWeight="bold">Launch!</text>
                  <path d="M132 95 L132 105" stroke="#E84393" strokeWidth="1" fill="none"/>

                  <rect x="178" y="65" width="72" height="50" rx="8" fill="#D5F5E3" stroke="#00B894" strokeWidth="1.5"/>
                  <text x="214" y="86" textAnchor="middle" fontSize="7.5" fill="#00B894" fontWeight="bold">Sketch Ideas</text>
                  <path d="M184 102 Q200 94 230 102" stroke="#00B894" strokeWidth="1.5" fill="none"/>

                  <defs>
                    <marker id="aAP2" markerWidth="5" markerHeight="4" refX="4" refY="2" orient="auto">
                      <polygon points="0 0, 5 2, 0 4" fill="#B7950B"/>
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100 bg-white">
              <div className="flex gap-1.5">
                {['✏️','🖊️','⭕','↩️','↪️'].map((e,i)=>(
                  <span key={i} className="text-[10px] cursor-pointer">{e}</span>
                ))}
              </div>
              <div className="flex gap-1">
                {['#1A1A2E','#6C5CE7','#0984E3'].map((c,i)=>(
                  <div key={i} className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{backgroundColor: c}}/>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pencil,
  Share2,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Download,
  Lock,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white/60 to-gray-50 dark:from-slate-900 dark:to-black text-slate-900 dark:text-slate-100 transition-colors">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border-b border-transparent dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-lg">Draw-App</span>
              <small className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">Real-time drawing & collaboration</small>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm hover:text-slate-700 dark:hover:text-slate-200">Features</Link>
            <Link href="#how" className="text-sm hover:text-slate-700 dark:hover:text-slate-200">How it works</Link>
            <Link href="#pricing" className="text-sm hover:text-slate-700 dark:hover:text-slate-200">Pricing</Link>
            <Link href="/signin" className="ml-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-2 text-white shadow hover:scale-[1.01] transition-transform">
              Open App <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>

          <div className="md:hidden">
            <Link href="/signin" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-white">
              Open
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="relative overflow-hidden">
          {/* Floating decorative gradients */}
          <motion.div
            initial={{ opacity: 0.12, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="pointer-events-none absolute -left-32 -top-24 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-indigo-400 via-violet-400 to-pink-400 blur-3xl opacity-30 dark:opacity-20 mix-blend-screen"
          />
          <motion.div
            initial={{ opacity: 0.08, scale: 1.05 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 1.6 }}
            className="pointer-events-none absolute -right-32 top-36 w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 blur-3xl opacity-30 dark:opacity-10 mix-blend-screen"
          />

          <div className="max-w-7xl mx-auto px-6 pt-20 pb-24">
            <div className="grid gap-12 grid-cols-1 md:grid-cols-2 items-center">
              {/* Left - headline */}
              <div className="space-y-6">
                <motion.h1
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.45 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight"
                >
                  Draw. Collaborate. Ship Faster.
                  <span className="block text-indigo-600 dark:text-indigo-400">Real-time canvas for teams</span>
                </motion.h1>

                <motion.p
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.16, duration: 0.45 }}
                  className="max-w-2xl text-lg text-slate-600 dark:text-slate-300"
                >
                  Create hand-drawn diagrams, wireframes, and visuals — together and in real time. Designed for speed,
                  privacy, and beautiful exports.
                </motion.p>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}>
                  <div className="flex gap-4">
                    <Link href="/signup" className="inline-flex items-center gap-3 rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:brightness-105 transition">
                      Get started — it's free
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link href="#how" className="inline-flex items-center gap-3 rounded-xl px-5 py-3 bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-transparent hover:opacity-90 transition">
                      Learn how it works
                    </Link>
                  </div>
                </motion.div>

                {/* Trust / small stats */}
                <div className="mt-6 flex flex-wrap gap-4 items-center text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-md bg-indigo-50 dark:bg-indigo-800/30 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-200">Teams & companies</div>
                      <div className="text-xs">Trusted by teams worldwide</div>
                    </div>
                  </div>

                  <div className="h-1 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-200">Blazing fast</div>
                      <div className="text-xs">Optimized for low latency</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - live preview mock */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.12, duration: 0.6 }}
                  className="w-full max-w-2xl rounded-2xl shadow-2xl ring-1 ring-inset ring-black/6 overflow-hidden"
                >
                  <div className="relative h-72 md:h-96 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-900/60">
                    <Image
                      src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=2000&q=80"
                      alt="Canvas preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/8 to-transparent mix-blend-overlay" />
                    <div className="absolute left-6 bottom-6 bg-white/80 dark:bg-slate-900/70 rounded-md px-3 py-2 flex gap-3 items-center backdrop-blur-sm">
                      <div className="text-sm font-medium">Live room</div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">2 guests</div>
                    </div>
                  </div>
                </motion.div>

                {/* small floating badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-6 right-8 bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" /> Real-time sync
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-10 md:grid-cols-3">
              <FeatureCard
                icon={<Zap className="w-6 h-6 text-emerald-500" />}
                title="Blazing performance"
                desc="Rendering engineered for minimal latency — draw smoothly even on low-end devices."
              />
              <FeatureCard
                icon={<Users className="w-6 h-6 text-indigo-500" />}
                title="Real-time collaboration"
                desc="Shared rooms, presence indicators, and live cursors let teams co-create together."
              />
              <FeatureCard
                icon={<Download className="w-6 h-6 text-violet-500" />}
                title="Export & share"
                desc="Export to PNG, SVG, or JSON. Share editable links instantly with access controls."
              />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-20 bg-gradient-to-b from-transparent to-slate-50 dark:to-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">How it works</h3>
                <ol className="space-y-6 text-slate-600 dark:text-slate-300">
                  <li>
                    <strong className="block text-slate-800 dark:text-slate-100">Create a room</strong>
                    Start a secure room and invite teammates with a link — no account required for viewers.
                  </li>
                  <li>
                    <strong className="block text-slate-800 dark:text-slate-100">Draw & collaborate</strong>
                    Use the toolbar to draw shapes, pen, text and more. Every stroke syncs in realtime.
                  </li>
                  <li>
                    <strong className="block text-slate-800 dark:text-slate-100">Export / save</strong>
                    Export as PNG, SVG or JSON for backups or sharing with stakeholders.
                  </li>
                </ol>
              </div>

              <div>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  <MiniPanel icon={<Pencil />} title="Drawing tools" desc="Smart pen, shape recognition, and snapping." />
                  <MiniPanel icon={<Share2 />} title="Sharing" desc="Short links, iframe embedding, and permission controls." />
                  <MiniPanel icon={<Lock />} title="Privacy first" desc="End-to-end room tokens and optional encryption." />
                  <MiniPanel icon={<Users />} title="Presence" desc="See who’s in the room and follow their cursor." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold">Simple transparent pricing</h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">Free for personal use. Teams get advanced controls, history and priority support.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <PriceCard title="Free" price="0" subtitle="Personal" features={["Unlimited canvases", "Export PNG & SVG", "Basic collaboration"]} highlight={false} />
              <PriceCard title="Pro" price="12" subtitle="per editor / month" features={["Version history", "Private rooms", "Priority support"]} highlight={true} />
              <PriceCard title="Enterprise" price="Custom" subtitle="contact sales" features={["SAML SSO", "Dedicated infra", "Account management"]} highlight={false} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-b from-indigo-600 to-violet-600 text-white rounded-xl mx-6 md:mx-12 -mt-6 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-2xl font-bold">Ready to collaborate in real-time?</h4>
              <p className="mt-2 text-slate-100/90">Start a room and invite teammates — free forever for personal use.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/signup" className="inline-flex items-center gap-3 rounded-xl bg-white text-indigo-700 px-5 py-3 font-semibold shadow hover:scale-[1.02] transition-transform">
                Start free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#pricing" className="inline-flex items-center gap-3 rounded-xl bg-white/20 text-white px-5 py-3 font-semibold shadow hover:brightness-110 transition">
                View plans
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-20 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Excalidraw Clone</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Real-time drawing, reimagined</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Built for creators who love speed and simplicity.</p>
            </div>

            <div>
              <h5 className="font-medium mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="#">Features</Link></li>
                <li><Link href="#">Examples</Link></li>
                <li><Link href="#">Docs</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-3">Company</h5>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="#">About</Link></li>
                <li><Link href="#">Careers</Link></li>
                <li><Link href="#">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-3">Legal</h5>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="#">Privacy</Link></li>
                <li><Link href="#">Terms</Link></li>
                <li><Link href="#">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Excalidraw Clone — All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ----------------------- UI subcomponents ----------------------- */

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string; }) {
  return (
    <motion.div whileHover={{ y: -6 }} className="bg-white/80 dark:bg-slate-800/60 rounded-2xl p-6 shadow-md border border-transparent dark:border-slate-700 transition">
      <div className="w-12 h-12 rounded-lg bg-white/90 dark:bg-slate-900/60 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-slate-600 dark:text-slate-300 text-sm">{desc}</p>
    </motion.div>
  );
}

function MiniPanel({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string; }) {
  return (
    <div className="rounded-xl p-4 bg-white/70 dark:bg-slate-800/60 shadow-sm border border-transparent dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">{icon}</div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function PriceCard({ title, price, subtitle, features, highlight }: { title: string; price: string; subtitle?: string; features: string[]; highlight?: boolean; }) {
  return (
    <motion.div whileHover={{ y: -8 }} className={`rounded-3xl p-8 border ${highlight ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl" : "bg-white/80 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100"} ${highlight ? "border-transparent" : "border-transparent"}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className={`text-lg font-semibold ${highlight ? "text-white" : ""}`}>{title}</div>
          <div className={`text-sm ${highlight ? "text-indigo-100/90" : "text-slate-500 dark:text-slate-300"}`}>{subtitle}</div>
        </div>
        <div className="text-3xl font-bold">{price === "0" ? "$0" : price === "Custom" ? price : `$${price}/mo`}</div>
      </div>

      <ul className={`mb-6 space-y-3 ${highlight ? "text-indigo-50/90" : "text-slate-600 dark:text-slate-300"}`}>
        {features.map((f) => (
          <li key={f} className="text-sm">• {f}</li>
        ))}
      </ul>

      <div>
        <button className={`${highlight ? "bg-white text-indigo-700" : "bg-indigo-600 text-white"} px-5 py-3 rounded-lg font-semibold w-full`}>
          {highlight ? "Start free — Pro" : title === "Free" ? "Get started" : "Contact sales"}
        </button>
      </div>
    </motion.div>
  );
}

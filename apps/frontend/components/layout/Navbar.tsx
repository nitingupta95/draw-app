"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Pencil } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-lg border-b border-white/10 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
            <Pencil size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">Draw App</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="#architecture" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Architecture</Link>
          <Link href="#tech-stack" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Tech Stack</Link>
          <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
          <Link href="https://github.com" target="_blank" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">GitHub</Link>
          
          <Link href="/signin" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-105">
            Get Started
          </Link>
        </div>

        <button 
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
          <div className="p-6 flex justify-end">
            <button 
              className="text-foreground p-2"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col items-center gap-8 p-12">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground">Features</Link>
            <Link href="#architecture" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground">Architecture</Link>
            <Link href="#tech-stack" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground">Tech Stack</Link>
            <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-foreground">Docs</Link>
            <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="mt-8 rounded-xl bg-primary px-8 py-4 text-xl font-bold text-primary-foreground w-full text-center">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/' && localStorage.getItem("Authorization")) {
      router.push("/room");
    }
  }, [pathname, router]);

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
        scrolled 
          ? 'glass-nav shadow-sm border-b border-card-border py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground shadow-glow-sm group-hover:shadow-glow-md transition-all group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">DrawApp</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.label}
              href={link.href} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          
          <Link 
            href="/signin" 
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-sm hover:shadow-glow-md hover:bg-primary-dark transition-all hover:scale-105"
          >
            Try DrawApp
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-primary-foreground">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-bold text-xl text-foreground">DrawApp</span>
            </Link>
            <button 
              className="text-foreground p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex flex-col items-center gap-6 p-12">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/signin" 
              onClick={() => setMobileMenuOpen(false)} 
              className="mt-6 rounded-full bg-primary px-8 py-4 text-lg font-bold text-primary-foreground w-full text-center shadow-glow-md hover:bg-primary-dark transition-all"
            >
              Try DrawApp
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

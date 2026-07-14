import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t border-card-border py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">Sketch Collab</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm text-center md:text-left leading-relaxed">
            The real-time collaborative whiteboard for modern teams to sketch, brainstorm and build together.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sketch Collab. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

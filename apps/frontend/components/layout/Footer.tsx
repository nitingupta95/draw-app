import React from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary text-primary-foreground">
                <Pencil size={14} />
              </div>
              <span className="font-bold text-lg text-foreground">Draw App</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Sketch, brainstorm, and design together — instantly. A robust open-source collaborative whiteboard.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link href="#architecture" className="text-sm text-muted-foreground hover:text-foreground">Architecture</Link></li>
              <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">Docs</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-4">Community</h4>
            <ul className="space-y-2">
              <li><Link href="https://github.com" target="_blank" className="text-sm text-muted-foreground hover:text-foreground">GitHub</Link></li>
              <li><Link href="https://github.com/issues" target="_blank" className="text-sm text-muted-foreground hover:text-foreground">Issues</Link></li>
              <li><Link href="/license" className="text-sm text-muted-foreground hover:text-foreground">License</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Draw App. Open source.
          </p>
          <p className="text-xs text-muted-foreground mt-2 md:mt-0">
            Built with Next.js, WebSockets & Prisma.
          </p>
        </div>
      </div>
    </footer>
  );
}

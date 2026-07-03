"use client";

import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { CodeBlock } from '../ui/CodeBlock';
import { Card } from '../ui/Card';

export function GettingStarted() {
  return (
    <section id="getting-started" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading 
          title="Self-Host in Minutes" 
          subtitle="Everything you need to run your own real-time drawing server locally."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-10">1</div>
            <Card className="h-full pt-8">
              <h3 className="font-bold text-lg mb-4">Start Database</h3>
              <p className="text-muted-foreground text-sm mb-4">Spin up the local PostgreSQL instance via Docker Compose.</p>
              <CodeBlock code="cd packages/db && docker compose up -d" language="bash" />
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-10">2</div>
            <Card className="h-full pt-8">
              <h3 className="font-bold text-lg mb-4">Run Migrations</h3>
              <p className="text-muted-foreground text-sm mb-4">Push the Prisma schema to the running database.</p>
              <CodeBlock code="pnpm --filter @repo/db prisma db push" language="bash" />
            </Card>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-10">3</div>
            <Card className="h-full pt-8">
              <h3 className="font-bold text-lg mb-4">Start Full Stack</h3>
              <p className="text-muted-foreground text-sm mb-4">Build and run the entire stack locally.</p>
              <CodeBlock code="cd ../../ && docker compose up --build" language="bash" />
            </Card>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="font-bold text-xl mb-6 text-center">Service URLs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-xl border border-white/5 flex flex-col">
              <span className="text-muted-foreground text-sm mb-1">Frontend App</span>
              <code className="text-primary font-mono font-bold">http://localhost:8000</code>
            </div>
            <div className="bg-background p-4 rounded-xl border border-white/5 flex flex-col">
              <span className="text-muted-foreground text-sm mb-1">HTTP API</span>
              <code className="text-emerald-500 font-mono font-bold">http://localhost:4000</code>
            </div>
            <div className="bg-background p-4 rounded-xl border border-white/5 flex flex-col">
              <span className="text-muted-foreground text-sm mb-1">WebSocket Server</span>
              <code className="text-blue-500 font-mono font-bold">ws://localhost:8088</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

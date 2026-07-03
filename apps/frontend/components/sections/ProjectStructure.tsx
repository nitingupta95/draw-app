"use client";

import React from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { CodeBlock } from '../ui/CodeBlock';

const treeCode = `draw-app/
├── apps/
│   ├── frontend/         # Next.js marketing + app
│   ├── http-backend/     # Express REST API
│   └── ws-backend/       # WebSocket server
├── packages/
│   ├── db/               # Prisma schema & PostgreSQL
│   ├── ui/               # Shared React components
│   └── backend-common/   # Shared utilities/auth
├── docker-compose.yml    # Local dev orchestration
├── turbo.json            # Turborepo pipelines
└── pnpm-workspace.yaml   # Monorepo setup`;

export function ProjectStructure() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeading 
            title="Clean Monorepo" 
            subtitle="Organized with Turborepo and pnpm workspaces for maximum developer velocity and zero duplication."
            align="left"
          />
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            By separating concerns into distinct apps and packages, Draw App maintains a strictly typed boundary between the frontend UI, the real-time drawing server, and the database layer.
          </p>
        </div>
        
        <div className="w-full">
          <CodeBlock code={treeCode} language="bash" />
        </div>
      </div>
    </section>
  );
}

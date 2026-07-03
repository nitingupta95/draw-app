"use client";

import React from 'react';
import { WS_EXAMPLES } from '../../lib/constants';
import { CodeBlock } from '../ui/CodeBlock';
import { SectionHeading } from '../ui/SectionHeading';
import { Card } from '../ui/Card';

export function WebSocketDocs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <SectionHeading 
        title="WebSocket API Reference" 
        subtitle="Connect, join rooms, and synchronize shapes in real time."
        align="left"
      />
      
      <div className="space-y-12 mt-12">
        {WS_EXAMPLES.map((example, index) => (
          <Card key={index} className="bg-[#0A0A0B] border-white/10">
            <h3 className="text-xl font-bold mb-2 text-foreground capitalize font-mono">
              Event: {example.type}
            </h3>
            <p className="text-muted-foreground mb-6">
              {example.description}
            </p>
            <CodeBlock 
              code={JSON.stringify(example.payload, null, 2)} 
              language="json" 
            />
          </Card>
        ))}
      </div>
    </div>
  );
}

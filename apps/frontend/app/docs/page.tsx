import React from 'react';
import { WebSocketDocs } from '../../components/sections/WebSocketDocs';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const metadata = {
  title: 'Documentation | Draw App',
  description: 'API reference and technical documentation for Draw App.',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <Navbar />
      <main className="flex-grow">
        <WebSocketDocs />
      </main>
      <Footer />
    </div>
  );
}

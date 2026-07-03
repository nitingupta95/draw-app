import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div 
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 shadow-sm ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}

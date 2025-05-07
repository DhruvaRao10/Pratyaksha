import React from 'react';
import { BrainCog } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'small';
  className?: string;
}

export default function Logo({ variant = 'default', className = '' }: LogoProps) {
  if (variant === 'small') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <BrainCog className="h-5 w-5 text-primary" />
        <span className="font-bold text-lg text-white">P</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
    <div className="relative">
      <BrainCog className="h-6 w-6 text-primary" />
      <div className="absolute inset-0 bg-primary blur-md opacity-40 rounded-full -z-10"></div>
    </div>
    <div>
      <span className="font-bold text-xl tracking-wide text-white relative -translate-x-12"> 
        PRATYAKSH
        <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary to-blue-400 blur-md opacity-30 -z-10"></span>
      </span>
    </div>
  </div>
  );
} 

import { cn } from '@/lib/utils';
import React from 'react';

const HeroBackground = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div className={cn("relative bg-dark-pine text-white overflow-hidden", className)}>
      <div className="absolute inset-0 bg-black/30"></div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 100%, hsl(141, 53%, 41%, 0.5) 0%, transparent 40%), radial-gradient(circle at 10% 20%, hsl(141, 53%, 41%, 0.3) 0%, transparent 25%), radial-gradient(circle at 90% 80%, hsl(141, 53%, 41%, 0.3) 0%, transparent 25%)',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default HeroBackground;

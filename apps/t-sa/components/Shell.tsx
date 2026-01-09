import React from 'react';
import { cn } from '../lib/utils';
import { LayoutGrid, Zap, ShieldCheck } from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
  activeTab: 'analysis' | 'modules' | 'settings';
  onTabChange: (tab: 'analysis' | 'modules' | 'settings') => void;
}

export const Shell: React.FC<ShellProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-2 font-bold text-xl">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span>T-SA</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Specification Analysis</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => onTabChange('analysis')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'analysis' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Analysis
          </button>
          
          <button
            onClick={() => onTabChange('modules')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              activeTab === 'modules' 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Zap className="w-4 h-4" />
            Modules
          </button>
        </nav>

        <div className="p-4 border-t border-border/50">
           <div className="text-xs text-muted-foreground text-center">
              v0.0.1 Beta
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
         <div className="container max-w-6xl mx-auto p-8 relative z-10">
            {children}
         </div>
      </main>
    </div>
  );
};

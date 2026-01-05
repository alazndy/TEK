import React from 'react';
import { cn } from '../lib/utils';
import { LayoutGrid, Box, Settings, Menu } from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
  activeTab: 'analysis' | 'modules' | 'settings';
  onTabChange: (tab: 'analysis' | 'modules' | 'settings') => void;
}

export function Shell({ children, activeTab, onTabChange }: ShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const navItems = [
    { id: 'analysis', label: 'Analysis', icon: LayoutGrid },
    { id: 'modules', label: 'Ecosystem Modules', icon: Box },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col z-20",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-border justify-between">
          {isSidebarOpen && (
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              T-SA
            </span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-accent rounded-md"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                ME
             </div>
             {isSidebarOpen && (
                <div className="text-sm">
                    <p className="font-medium">Engineer</p>
                    <p className="text-xs text-muted-foreground">T-Ecosystem</p>
                </div>
             )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
         <div className="max-w-7xl mx-auto p-6 lg:p-8">
            {children}
         </div>
      </main>
    </div>
  );
}

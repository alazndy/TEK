'use client';

import { MobileSidebar } from '@/components/layout/mobile-sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
   DropdownMenu, 
   DropdownMenuContent, 
   DropdownMenuItem, 
   DropdownMenuLabel, 
   DropdownMenuSeparator, 
   DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { NotificationBell } from '@/components/notifications';
import { LanguageSwitcher } from '@/components/language-switcher';
import { EcosystemSwitcher } from '@/components/ecosystem-switcher';
import { ModeToggle } from '@/components/mode-toggle';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
   const user = useAuthStore((state) => state.user);
   const logout = useAuthStore((state) => state.logout);
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
       setMounted(true);
   }, []);

  return (
    <div className="flex items-center px-8 py-4 sticky top-0 z-40 bg-background/40 backdrop-blur-xl border-b border-border/50">
      <MobileSidebar />

      {/* Search Bar / Command Palette Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <div className="flex items-center w-full bg-muted/30 dark:bg-white/3 border border-border/50 hover:border-border dark:hover:border-white/15 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 px-9 py-2 rounded-xl transition-all duration-300">
            <span className="text-sm text-muted-foreground flex-1">Search or type a command...</span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 dark:bg-white/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex flex-1 justify-end items-center gap-x-4">
         <EcosystemSwitcher />

         <div className="h-4 w-px bg-border/50" />

         <div className="flex items-center gap-x-2">
            <ModeToggle />
            <LanguageSwitcher />
            <NotificationBell />
         </div>

         <div className="h-4 w-px bg-border/50" />

         {!mounted ? (
            <div className="h-9 w-9 rounded-full bg-white/5 animate-pulse" />
         ) : (
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-white/10 hover:border-primary/50 transition-colors">
                       <Avatar className="h-full w-full">
                          <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                          <AvatarFallback className="bg-primary/20 text-primary">{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                       </Avatar>
                    </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-56 bg-zinc-950 border-white/10" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                       <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-white">{user?.displayName}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                       </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="focus:bg-primary/20 focus:text-white" onClick={() => logout()}>
                       Log out
                    </DropdownMenuItem>
                 </DropdownMenuContent>
              </DropdownMenu>
         )}
      </div>
    </div>
  );
}

"use client"

import React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Search,
  LayoutGrid,
  Boxes,
  ShoppingCart,
  FlaskConical,
  ClipboardCheck,
  BarChart2,
  HardHat,
  FileText,
  History,
  LogOut,
  Moon,
  Sun,
  Archive,
  Menu,
} from "lucide-react"
import { usePathname } from 'next/navigation'
import Link from "next/link"
import { useSearch } from "@/context/search-context"
import { useAuth } from "@/context/auth-context"
import { useTheme } from "next-themes"
import { useOnboardingStore } from "@/stores/onboarding-store"
import { useSidebar } from "./sidebar-context"
import { CurrencySelector } from "@/components/currency-selector"
import { LanguageSwitcher } from "@/components/language-switcher"
import { EcosystemSwitcher } from "@/components/ecosystem-switcher"
import { useTranslations } from 'next-intl';
import { NotificationCenter } from "@/components/notification-center"

export function Header() {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, signOut } = useAuth();
  const { setTheme, theme } = useTheme();
  const { setHasCompletedOnboarding } = useOnboardingStore();
  const { setIsSidebarOpen } = useSidebar();
  const [logoClickCount, setLogoClickCount] = React.useState(0);
  const t = useTranslations('Common');

  // Logic for logo click (easter egg / onboarding reset)
  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    if (newCount >= 5) {
        setHasCompletedOnboarding(false);
        setLogoClickCount(0);
    } else {
        setLogoClickCount(newCount);
    }
  }

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  const getInitials = (email?: string | null) => {
    if (!email) return "OA";
    return email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-6 transition-all duration-200">
      {/* Mobile Menu Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menüyü aç</span>
      </Button>

      {/* Search / Command Palette Proxy */}
      <div className="flex-1 md:flex-none md:w-[320px]">
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              type="search"
              placeholder={t('searchPlaceholder')}
              className="w-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 pl-10 h-10 rounded-xl transition-all duration-200 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 opacity-50">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>
        </div>
      </div>

      {/* Right Actions Area */}
      <div className="ml-auto flex items-center gap-2">
        <EcosystemSwitcher />
        
        <div className="hidden sm:flex items-center gap-1 border-l border-border/50 pl-2 ml-1">
            <CurrencySelector />
            <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-1 border-l border-border/50 pl-2 ml-1">
            <NotificationCenter />
            
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Temayı değiştir</span>
            </Button>
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ml-1 ring-2 ring-primary/10 hover:ring-primary/20 transition-all"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || undefined} alt="Kullanıcı avatarı" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName || "Kullanıcı"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">{t('settings')}</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Destek</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

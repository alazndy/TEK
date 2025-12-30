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
import { useSidebar } from "./sidebar"
import { CurrencySelector } from "@/components/currency-selector"
import { LanguageSwitcher } from "@/components/language-switcher"

// navLinks moved inside Header component for translations


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

  const navLinks = [
      { href: "/dashboard", label: t('dashboard'), icon: LayoutGrid },
      { href: "/inventory", label: t('catalog'), icon: Boxes }, // Assuming catalog maps to inventory for now or add inventory to translation
      { href: "/equipment", label: "Ekipman", icon: HardHat }, // Needs key
      { href: "/consumables", label: "Sarf Malzemeler", icon: FlaskConical }, // Needs key
      { href: "/orders", label: "Siparişler", icon: ShoppingCart }, // Needs key
      { href: "/proposals", label: "Teklifler", icon: FileText }, // Needs key
      { href: "/physical-count", label: "Fiziksel Sayım", icon: ClipboardCheck }, // Needs key
      { href: "/reports", label: "Raporlar", icon: BarChart2 }, // Needs key
      { href: "/audit-log", label: "Denetim Kaydı", icon: History }, // Needs key
      { href: "/discontinued", label: "Üretilmeyenler", icon: Archive }, // Needs key
  ];
  
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === path
    }
    return pathname.startsWith(path)
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

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    if (newCount >= 5) {
        setHasCompletedOnboarding(false);
        setLogoClickCount(0);
    } else {
        setLogoClickCount(newCount);
    }
  }


  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-card px-3 sm:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menüyü aç</span>
      </Button>




      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
      <EcosystemSwitcher />
      <CurrencySelector />
      <LanguageSwitcher />
       <NotificationCenter />
       <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Temayı değiştir</span>
        </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar>
              <AvatarImage src={user?.photoURL || undefined} alt="Kullanıcı avatarı" />
              <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.email || "Hesabım"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
          <DropdownMenuItem>Destek</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

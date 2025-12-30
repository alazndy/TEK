'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Bell, 
  Users, 
  Shield, 
  Building2,
  Palette
} from 'lucide-react';

const settingsNav = [
  {
    label: 'Genel',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Bildirimler',
    href: '/settings/notifications',
    icon: Bell,
  },
  {
    label: 'Ekip',
    href: '/settings/team',
    icon: Users,
  },
  {
    label: 'Güvenlik',
    href: '/settings/security',
    icon: Shield,
  },
  {
    label: 'Şirket',
    href: '/settings/company',
    icon: Building2,
  },
  {
    label: 'Görünüm',
    href: '/settings/appearance',
    icon: Palette,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">
          Uygulama ve hesap ayarlarını yönetin
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <nav className="w-64 flex-shrink-0">
          <ul className="space-y-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/settings' && pathname?.startsWith(item.href));
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

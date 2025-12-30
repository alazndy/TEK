'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Users, 
  Shield, 
  Building2,
  ChevronRight,
  Settings,
  Palette
} from 'lucide-react';
import Link from 'next/link';

const settingsSections = [
  {
    title: 'Bildirimler',
    description: 'Stok uyarıları, Slack ve e-posta entegrasyonları',
    href: '/settings/notifications',
    icon: Bell,
    color: 'text-amber-500',
  },
  {
    title: 'Ekip Yönetimi',
    description: 'Kullanıcıları ve rolleri yönetin',
    href: '/settings/team',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: 'Güvenlik',
    description: 'Şifre ve iki faktörlü doğrulama',
    href: '/settings/security',
    icon: Shield,
    color: 'text-green-500',
  },
  {
    title: 'Şirket Bilgileri',
    description: 'Logo, adres ve iletişim bilgileri',
    href: '/settings/company',
    icon: Building2,
    color: 'text-purple-500',
  },
  {
    title: 'Görünüm',
    description: 'Tema ve arayüz tercihleri',
    href: '/settings/appearance',
    icon: Palette,
    color: 'text-pink-500',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Genel Ayarlar</h2>
        <p className="text-muted-foreground">
          Tüm ayar kategorilerini aşağıda bulabilirsiniz
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Card key={section.href} className="hover:shadow-md transition-shadow">
            <Link href={section.href}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sistem Bilgisi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Versiyon</span>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <span className="text-muted-foreground">Son Güncelleme</span>
              <p className="font-medium">{new Date().toLocaleDateString('tr-TR')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Durum</span>
              <Badge variant="outline" className="text-green-500 border-green-500">
                Aktif
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Lisans</span>
              <p className="font-medium">Enterprise</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function AppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('Settings');

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Görünüm</CardTitle>
          <CardDescription>Uygulama temasını özelleştirin.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Görünüm</CardTitle>
        <CardDescription>Uygulama temasını özelleştirin.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Tema</Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-4"
          >
            {/* Light Theme */}
            <Label
              htmlFor="light"
              className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent ${
                theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <Sun className={`h-6 w-6 mb-2 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${theme === 'light' ? 'text-primary' : ''}`}>
                Açık
              </span>
            </Label>

            {/* Dark Theme */}
            <Label
              htmlFor="dark"
              className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent ${
                theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <Moon className={`h-6 w-6 mb-2 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-primary' : ''}`}>
                Koyu
              </span>
            </Label>

            {/* System Theme */}
            <Label
              htmlFor="system"
              className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all hover:bg-accent ${
                theme === 'system' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <RadioGroupItem value="system" id="system" className="sr-only" />
              <Monitor className={`h-6 w-6 mb-2 ${theme === 'system' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${theme === 'system' ? 'text-primary' : ''}`}>
                Sistem
              </span>
            </Label>
          </RadioGroup>

          <p className="text-xs text-muted-foreground mt-2">
            Şu anki tema: <span className="font-medium capitalize">{resolvedTheme === 'dark' ? 'Koyu' : 'Açık'}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ECRList } from '@/components/engineering/ecr-list';
import { AddECRDialog } from '@/components/engineering/add-ecr-dialog';
import { useState } from 'react';

export default function ECRPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Mühendislik Değişim Talepleri (ECR)
          </h2>
          <p className="text-muted-foreground text-sm">
            Tasarım iyileştirmeleri ve teknik sorun çözüm taleplerini yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddECRDialog />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Talep no veya başlık ara..."
            className="pl-10 h-11 bg-muted/30 dark:bg-white/5 border-border/50 dark:border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl transition-all" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl border-border/50 dark:border-white/10 bg-muted/30 dark:bg-white/5">
          <Filter className="mr-2 h-4 w-4" /> Filtrele
        </Button>
      </div>

      <ECRList searchTerm={searchTerm} />
    </div>
  );
}

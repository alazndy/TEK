'use client';

import { useECMStore } from '@/stores/ecm-store';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface ECRListProps {
  searchTerm: string;
}

const statusConfig = {
  open: { label: 'Açık', color: 'bg-blue-500/10 text-blue-500', icon: Clock },
  under_review: { label: 'İncelemede', color: 'bg-amber-500/10 text-amber-500', icon: AlertCircle },
  approved: { label: 'Onaylandı', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 },
  rejected: { label: 'Reddedildi', color: 'bg-red-500/10 text-red-500', icon: XCircle },
  closed: { label: 'Kapalı', color: 'bg-zinc-500/10 text-zinc-500', icon: CheckCircle2 },
};

export function ECRList({ searchTerm }: ECRListProps) {
  const { ecrs, isLoading } = useECMStore();

  const filteredECRs = ecrs.filter(ecr => 
    ecr.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ecr.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground animate-pulse">Yükleniyor...</div>;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="hover:bg-transparent border-white/10">
            <TableHead className="w-[120px]">ID</TableHead>
            <TableHead>Başlık</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead>Oluşturma</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredECRs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                Kayıt bulunamadı.
              </TableCell>
            </TableRow>
          ) : (
            filteredECRs.map((ecr) => {
              const status = statusConfig[ecr.status];
              const StatusIcon = status.icon;

              return (
                <TableRow key={ecr.id} className="hover:bg-white/5 border-white/10 transition-colors cursor-pointer group">
                  <TableCell className="font-mono text-xs font-bold text-primary">
                    {ecr.identifier}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white group-hover:text-primary transition-colors">{ecr.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{ecr.description}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${status.color} border-none flex items-center gap-1.5 w-fit px-2 py-0.5`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/10 capitalize">
                      {ecr.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {format(ecr.createdAt, 'dd MMM yyyy', { locale: tr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-xs hover:bg-white/10">
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

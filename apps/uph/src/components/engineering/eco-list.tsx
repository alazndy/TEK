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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Layers
} from 'lucide-react';

interface ECOListProps {
  searchTerm: string;
}

const statusConfig = {
  open: { label: 'Açık', color: 'bg-blue-500/10 text-blue-500', icon: Play },
  hold: { label: 'Beklemede', color: 'bg-amber-500/10 text-amber-500', icon: Pause },
  released: { label: 'Yayınlandı', color: 'bg-indigo-500/10 text-indigo-500', icon: CheckCircle2 },
  scheduled: { label: 'Planlandı', color: 'bg-emerald-500/10 text-emerald-500', icon: Calendar },
  implemented: { label: 'Uygulandı', color: 'bg-zinc-500/10 text-zinc-500', icon: CheckCircle2 },
  cancelled: { label: 'İptal', color: 'bg-red-500/10 text-red-500', icon: XCircle },
};

const priorityColors = {
  low: 'border-blue-500/30 text-blue-400',
  routine: 'border-zinc-500/30 text-zinc-400',
  high: 'border-amber-500/30 text-amber-400',
  urgent: 'border-red-500/30 text-red-400',
};

export function ECOList({ searchTerm }: ECOListProps) {
  const { ecos, isLoading } = useECMStore();

  const filteredECOs = ecos.filter(eco => 
    eco.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eco.title.toLowerCase().includes(searchTerm.toLowerCase())
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
            <TableHead>Revizyonlar</TableHead>
            <TableHead>Oluşturma</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredECOs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                Kayıt bulunamadı.
              </TableCell>
            </TableRow>
          ) : (
            filteredECOs.map((eco) => {
              const status = statusConfig[eco.status];
              const StatusIcon = status.icon;

              return (
                <TableRow key={eco.id} className="hover:bg-white/5 border-white/10 transition-colors cursor-pointer group">
                  <TableCell className="font-mono text-xs font-bold text-primary">
                    {eco.identifier}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-white group-hover:text-primary transition-colors">{eco.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{eco.responsibleDept}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${status.color} border-none flex items-center gap-1.5 w-fit px-2 py-0.5`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${priorityColors[eco.priority]}`}>
                      {eco.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Layers className="h-3.5 w-3.5" />
                      {eco.revisedItems.length} Kalem
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {format(eco.createdAt, 'dd MMM yyyy', { locale: tr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-xs hover:bg-white/10">
                      Yönet
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

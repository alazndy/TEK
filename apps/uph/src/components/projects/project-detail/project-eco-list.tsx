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
import { Clock, CheckCircle2, PlayCircle, Pause, XCircle, Plus, Wrench } from 'lucide-react';
import { AddECODialog } from '@/components/engineering/add-eco-dialog';

interface ProjectECOListProps {
  projectId: string;
}

const statusConfig = {
  open: { label: 'Açık', color: 'bg-blue-500/10 text-blue-500', icon: Clock },
  hold: { label: 'Beklemede', color: 'bg-amber-500/10 text-amber-500', icon: Pause },
  released: { label: 'Yayınlandı', color: 'bg-green-500/10 text-green-500', icon: PlayCircle },
  scheduled: { label: 'Planlandı', color: 'bg-purple-500/10 text-purple-500', icon: Clock },
  implemented: { label: 'Uygulandı', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 },
  cancelled: { label: 'İptal', color: 'bg-red-500/10 text-red-500', icon: XCircle },
};

export function ProjectECOList({ projectId }: ProjectECOListProps) {
  const { getProjectECOs, isLoading } = useECMStore();
  const ecos = getProjectECOs(projectId);

  if (isLoading) {
    return <div className="py-10 text-center text-muted-foreground animate-pulse">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mühendislik Değişiklik Emirleri (ECO)</h3>
        <AddECODialog 
          projectId={projectId}
          trigger={
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni ECO
            </Button>
          }
        />
      </div>

      {ecos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/50 p-12 text-center">
          <Wrench className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">Bu projede henüz ECO kaydı bulunmuyor.</p>
          <p className="text-muted-foreground text-xs mt-1">Yeni bir değişiklik emri oluşturmak için yukarıdaki butonu kullanın.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-zinc-950/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/10">
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Onay</TableHead>
                <TableHead>Revize Edilen</TableHead>
                <TableHead>Oluşturma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ecos.map((eco) => {
                const status = statusConfig[eco.status];
                const StatusIcon = status.icon;

                return (
                  <TableRow key={eco.id} className="hover:bg-white/5 border-white/10 transition-colors">
                    <TableCell className="font-mono text-xs font-bold text-primary">
                      {eco.identifier}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-white">{eco.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${status.color} border-none flex items-center gap-1.5 w-fit px-2 py-0.5`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={eco.approvalStatus === 'approved' ? 'default' : 'outline'} className="capitalize">
                        {eco.approvalStatus === 'approved' ? '✓ Onaylı' : eco.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {eco.revisedItems.length} öğe
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(eco.createdAt, 'dd MMM yyyy', { locale: tr })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}


'use client';

import { useProjectStore } from '@/stores/project-store';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';

interface RAIDLogProps {
  projectId: string;
}

export function RAIDLog({ projectId }: RAIDLogProps) {
  const { risks, raidEntries } = useProjectStore();
  
  const projectRisks = risks.filter(r => r.projectId === projectId);
  const projectRaid = raidEntries.filter(r => r.projectId === projectId);

  const renderTable = (items: any[], type: string) => (
      <div className="rounded-md border border-white/10 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-white/10">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Priority/Severity</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Created</div>
        </div>
        <ScrollArea className="h-[400px]">
            {items.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No entries found.</div>
            ) : (
                items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center text-sm">
                        <div className="col-span-5 font-medium text-white truncate" title={item.description || item.title}>
                            {type === 'Risk' ? item.title : item.description}
                        </div>
                        <div className="col-span-2">
                            {type === 'Risk' ? (
                                <Badge variant="outline" className={item.severity >= 15 ? "text-red-400 border-red-400" : "text-yellow-400 border-yellow-400"}>
                                    Score: {item.severity}
                                </Badge>
                            ) : (
                                <Badge variant="secondary">{item.priority}</Badge>
                            )}
                        </div>
                        <div className="col-span-2">
                             <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.status === 'Open' ? 'bg-green-500' : 'bg-gray-500'}`} />
                                <span className="capitalize text-xs text-muted-foreground">{item.status.toLowerCase()}</span>
                             </div>
                        </div>
                        <div className="col-span-3 text-xs text-muted-foreground">
                            {format(new Date(item.createdAt), 'MMM d, yyyy')}
                        </div>
                    </div>
                ))
            )}
        </ScrollArea>
      </div>
  );

  return (
    <Tabs defaultValue="risks" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="bg-black/20 border border-white/10">
            <TabsTrigger value="risks">Risks ({projectRisks.length})</TabsTrigger>
            <TabsTrigger value="issues">Issues ({projectRaid.filter(i => i.type === 'issue').length})</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies ({projectRaid.filter(i => i.type === 'dependency').length})</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="risks" className="mt-0">
         {renderTable(projectRisks, 'risk')}
      </TabsContent>
      <TabsContent value="issues" className="mt-0">
         {renderTable(projectRaid.filter(i => i.type === 'issue'), 'issue')}
      </TabsContent>
       <TabsContent value="dependencies" className="mt-0">
         {renderTable(projectRaid.filter(i => i.type === 'dependency'), 'dependency')}
      </TabsContent>
    </Tabs>
  );
}

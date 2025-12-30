'use client';

import { Activity, FolderKanban, Package, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Activity as ActivityType } from '@/types/activity';

interface ActivityFeedProps {
  t: any;
  activities: ActivityType[];
}

export function ActivityFeed({ t, activities }: ActivityFeedProps) {
  return (
    <div className="glass-panel rounded-4xl p-8 border border-border/50">
       <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-foreground dark:text-white">{t('latestActivity')}</h3>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
        </div>
      </div>
      
      <div className="relative space-y-6">
         {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">{t('noActivity')}</div>
         ) : (
            <>
              <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-linear-to-b from-primary/50 via-primary/5 to-transparent" />
              <div className="space-y-8">
                {activities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex gap-4 items-start relative group">
                    <div className={cn(
                      "z-10 rounded-full p-2 ring-4 ring-zinc-950 transition-all group-hover:scale-110",
                      activity.type.includes('PROJECT') ? "bg-primary text-white" :
                      activity.type.includes('INVENTORY') ? "bg-orange-500 text-white" :
                      "bg-zinc-800 text-zinc-400"
                    )}>
                      {activity.type.includes('PROJECT') ? <FolderKanban className="h-3.5 w-3.5" /> : 
                       activity.type.includes('INVENTORY') ? <Package className="h-3.5 w-3.5" /> :
                       <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground dark:text-white leading-snug group-hover:text-primary transition-colors">{activity.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                         {activity.description}
                      </p> 
                      <div className="flex items-center gap-2 pt-1">
                         <div className="h-4 w-4 rounded-full bg-zinc-800 text-[8px] flex items-center justify-center font-bold text-zinc-400">
                            {activity.userName?.charAt(0) || '?'}
                         </div>
                         <p className="text-[10px] text-muted-foreground/60" suppressHydrationWarning>
                            <span className="text-zinc-600 dark:text-zinc-400">{activity.userName || 'Unknown'}</span> • {activity.timestamp instanceof Date ? activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                         </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
         )}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { AuditLog } from "@/lib/types";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";

interface ActivityListWidgetProps {
  logs: AuditLog[];
}

export function ActivityListWidget({ logs }: ActivityListWidgetProps) {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const dateLocale = locale === 'tr' ? tr : enUS;

  const recentLogs = logs.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-400" />
          {t('recentActivities')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentLogs.length > 0 ? (
            recentLogs.map((log, index) => (
              <div key={`${log.id}-${index}`} className="flex flex-col gap-1 border-l-2 border-emerald-500/20 pl-4 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{log.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.date), 'HH:mm', { locale: dateLocale })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{log.details}</p>
                <span className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-wider">{log.user}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm">
              {t('noActivitiesFound')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

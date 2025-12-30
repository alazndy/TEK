
"use client"

import * as React from "react"
import { useDataStore } from "@/stores/data-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import { columns } from "@/components/audit-log/columns"
import { Loader2 } from "lucide-react"

export default function AuditLogPage() {
  const { logs, loadingLogs, fetchLogs, loadMoreLogs, hasMoreLogs } = useDataStore();

  React.useEffect(() => {
    if (logs.length === 0) {
      fetchLogs(true);
    }
  }, [fetchLogs, logs.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Denetim Kayıtları</CardTitle>
        <CardDescription>Sistemdeki tüm değişikliklerin kaydını görüntüleyin.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingLogs && logs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={logs} 
            onLoadMore={loadMoreLogs}
            hasMore={hasMoreLogs}
            isLoading={loadingLogs}
          />
        )}
      </CardContent>
    </Card>
  )
}

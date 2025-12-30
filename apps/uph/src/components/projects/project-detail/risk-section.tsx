"use client";

import { RAIDEntry } from "@/types/risk";
import { RaidLog } from "@/components/projects/raid/RaidLog";
import { RiskMatrix } from "@/components/projects/risk/RiskMatrix";
import { EVMCharts } from "@/components/projects/evm/EVMCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskSectionProps {
  projectId: string;
}

export function RiskSection({ projectId }: RiskSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Risk Matrix (Visual) */}
        <RiskMatrix projectId={projectId} />
        
        {/* Right Column: EVM Summary (Financial/Performance) */}
        <Card>
            <CardHeader>
                <CardTitle>Performans Özeti</CardTitle>
            </CardHeader>
            <CardContent>
                 <EVMCharts projectId={projectId} />
            </CardContent>
        </Card>
      </div>

      {/* Full Width: RAID Log (Detailed List) */}
      <Card>
        <CardHeader>
          <CardTitle>Risk, Varsayım, Sorun ve Bağımlılık Kayıtları (RAID)</CardTitle>
        </CardHeader>
        <CardContent>
          <RaidLog projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { RiskMatrix } from "@/components/risks/risk-matrix";
import { RAIDLog } from "@/components/risks/raid-log";
import { EVMChart } from "@/components/analytics/evm-chart";
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
        <EVMChart projectId={projectId} />
      </div>

      {/* Full Width: RAID Log (Detailed List) */}
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle>RAID Log</CardTitle>
        </CardHeader>
        <CardContent>
          <RAIDLog projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}

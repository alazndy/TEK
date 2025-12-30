"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";

interface EVMChartsProps {
  projectId: string;
}

// Mock Data Generator for EVM
const generateMockData = () => {
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu"];
  return months.map((month, index) => {
    const pv = (index + 1) * 10000;
    // EV slightly behind PV
    const ev = pv * (0.8 + Math.random() * 0.2); 
    // AC slightly higher than EV (over budget)
    const ac = ev * (1.0 + Math.random() * 0.3); 

    return {
      name: month,
      PV: Math.round(pv),
      EV: Math.round(ev),
      AC: Math.round(ac),
      CPI: Number((ev / ac).toFixed(2)),
      SPI: Number((ev / pv).toFixed(2)),
    };
  });
};

export function EVMCharts({ projectId }: EVMChartsProps) {
  const data = generateMockData();
  const current = data[data.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maliyet Performans Endeksi (CPI)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${current.CPI >= 1 ? 'text-green-600' : 'text-red-600'}`}>
              {current.CPI}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {current.CPI >= 1 ? "Bütçe Dahilinde" : "Bütçe Aşıldı"} (EV / AC)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Zaman Performans Endeksi (SPI)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${current.SPI >= 1 ? 'text-green-600' : 'text-red-600'}`}>
              {current.SPI}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {current.SPI >= 1 ? "Zamanında" : "Gecikmiş"} (EV / PV)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maliyet Sapması (CV)</CardTitle>
          </CardHeader>
          <CardContent>
             <div className={`text-2xl font-bold ${current.EV - current.AC >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(current.EV - current.AC).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (EV - AC)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kazanılmış Değer Analizi (Kümülatif)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="PV" stroke="#8884d8" name="Planlanan Değer (PV)"  strokeWidth={2}/>
                <Line type="monotone" dataKey="EV" stroke="#82ca9d" name="Kazanılan Değer (EV)" strokeWidth={2}/>
                <Line type="monotone" dataKey="AC" stroke="#ff7300" name="Gerçekleşen Maliyet (AC)" strokeWidth={2}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performans Endeksleri (CPI & SPI)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 2]} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={1} stroke="red" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="CPI" stroke="#8884d8" name="Maliyet Endeksi (CPI)" strokeWidth={2} />
                <Line type="monotone" dataKey="SPI" stroke="#82ca9d" name="Zaman Endeksi (SPI)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

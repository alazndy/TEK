export type FluxDeviceStatus = 'Online' | 'Offline' | 'Warning' | 'Maintenance';

export interface FluxDevice {
    id: string;
    name: string;
    location: string;
    status: FluxDeviceStatus;
    temperature?: number; // Celsius
    temp?: number; // Alias for temperature
    load: number; // Percentage 0-100
    powerConsumption?: number; // kW
    uptime: string;
    lastSeen: string;
    ipAddress?: string;
}

export interface FluxStats {
    onlineCount: number;
    totalDevices: number;
    totalPower: number; // kW
    avgTemp: number; // Celsius
    systemLoad: number; // Percentage
}

export interface FluxStatCard {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
}

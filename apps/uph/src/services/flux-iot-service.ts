
import mqtt, { MqttClient, IClientOptions } from 'mqtt';
import { FluxDevice } from '@/types/flux';

type MessageHandler = (deviceId: string, data: Partial<FluxDevice>) => void;
type StatusHandler = (isConnected: boolean, error?: string) => void;

interface BrokerConfig {
  url: string;
  username?: string;
  password?: string;
}

export class FluxIoTService {
  private static instance: FluxIoTService;
  private client: MqttClient | null = null;
  private isConnected: boolean = false;
  private subscribers: MessageHandler[] = [];
  private statusListeners: StatusHandler[] = [];

  private constructor() {}

  public static getInstance(): FluxIoTService {
    if (!FluxIoTService.instance) {
      FluxIoTService.instance = new FluxIoTService();
    }
    return FluxIoTService.instance;
  }

  public connect(config: BrokerConfig) {
    if (this.client) {
      this.client.end(true); // Force close existing connection
    }

    console.log(`[FluxIoT] Connecting to ${config.url}...`);

    const options: IClientOptions = {
        clean: true,
        connectTimeout: 4000,
        username: config.username,
        password: config.password,
        reconnectPeriod: 1000,
        clientId: 'flux_dashboard_' + Math.random().toString(16).substr(2, 8)
    };

    try {
        this.client = mqtt.connect(config.url, options);

        this.client.on('connect', () => {
            console.log('[FluxIoT] Connected to Broker.');
            this.isConnected = true;
            this.notifyStatus(true);
            
            // Subscribe to wildcard topic for all devices
            // Expected format: flux/devices/{deviceId}/telemetry
            this.client?.subscribe('flux/devices/+/telemetry', (err) => {
                if (err) console.error('[FluxIoT] Subscribe error:', err);
                else console.log('[FluxIoT] Subscribed to telemetry topic.');
            });
        });

        this.client.on('message', (topic, message) => {
            // Parse Topic: flux/devices/{deviceId}/telemetry
            const parts = topic.split('/');
            if (parts.length >= 3) {
                const deviceId = parts[2];
                try {
                    const payload = JSON.parse(message.toString());
                    this.notifySubscribers(deviceId, payload);
                } catch (e) {
                    console.warn('[FluxIoT] Failed to parse payload for', deviceId);
                }
            }
        });

        this.client.on('offline', () => {
            console.log('[FluxIoT] Connection offline.');
            this.isConnected = false;
            this.notifyStatus(false);
        });

        this.client.on('error', (err) => {
            console.error('[FluxIoT] Connection error:', err);
            this.isConnected = false;
            this.notifyStatus(false, err.message);
        });

    } catch (error: any) {
        console.error('[FluxIoT] Connection failed:', error);
        this.notifyStatus(false, error.message);
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
      this.isConnected = false;
      this.notifyStatus(false);
    }
  }

  public onMessage(handler: MessageHandler) {
    this.subscribers.push(handler);
    return () => {
      this.subscribers = this.subscribers.filter(h => h !== handler);
    };
  }

  public onStatusChange(handler: StatusHandler) {
    this.statusListeners.push(handler);
    return () => {
      this.statusListeners = this.statusListeners.filter(h => h !== handler);
    };
  }

  private notifyStatus(status: boolean, error?: string) {
    this.statusListeners.forEach(l => l(status, error));
  }

  private notifySubscribers(deviceId: string, data: Partial<FluxDevice>) {
      this.subscribers.forEach(h => h(deviceId, data));
  }
}

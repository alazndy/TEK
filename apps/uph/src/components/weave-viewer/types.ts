export interface Point {
  x: number;
  y: number;
}

export interface PortDefinition {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'input' | 'output' | 'bidirectional';
  connectorType: string;
  isPower?: boolean;
  isGround?: boolean;
  voltage?: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  ports: PortDefinition[];
}

export interface ProductInstance {
  id: string;
  templateId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  mirrored?: boolean;
  labelConfig?: {
    visible: boolean;
    fontSize: number;
    color: string;
    backgroundColor: string;
    position: 'bottom' | 'top' | 'center';
  };
}

export interface Connection {
  id: string;
  fromInstanceId: string;
  fromPortId: string;
  toInstanceId: string;
  toPortId: string;
  color?: string;
  shape?: 'curved' | 'straight' | 'orthogonal';
  controlPoints?: Point[];
}

export interface Page {
    id: string;
    name: string;
    instances: ProductInstance[];
    connections: Connection[];
}

export interface ProjectData {
    pages: Page[];
    templates: ProductTemplate[];
}

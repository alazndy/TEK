import { Point, Connection } from './types';

// Helper for orthogonal path rounding
const roundPolyline = (points: Point[], radius: number = 10): string => {
    if (points.length < 2) return "";
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        
        // Vector
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        const ux = dx/len;
        const uy = dy/len;

        const isLast = i === points.length - 1;
        const cornerR = isLast ? 0 : Math.min(radius, len/2);
        
        // Line to start of corner
        const drawLen = len - cornerR - (i > 1 ? Math.min(radius, Math.sqrt((prev.x-points[i-2].x)**2 + (prev.y-points[i-2].y)**2)/2) : 0);
        // Simplified approach: just draw to corner start
        // A robust implementation would managing start/end offsets. 
        // For read-only viewer, simple line is often enough, but let's try to match Weave's logic simplified.
        
        path += ` L ${curr.x} ${curr.y}`;
    }
    return path;
};

// Simplified path generator
export const getRoutePath = (start: Point, end: Point, shape: string = 'curved', controlPoints?: Point[]) => {
    if (controlPoints && controlPoints.length > 0) {
        if (shape === 'orthogonal') {
            let d = `M ${start.x} ${start.y}`;
            controlPoints.forEach(p => { d += ` L ${p.x} ${p.y}`; });
            d += ` L ${end.x} ${end.y}`;
            return d;
        } else {
            let d = `M ${start.x} ${start.y}`;
            controlPoints.forEach(p => { d += ` L ${p.x} ${p.y}`; });
            d += ` L ${end.x} ${end.y}`;
            return d;
        }
    }
    
    if (shape === 'straight') {
        return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    } else if (shape === 'orthogonal') {
        const midX = (start.x + end.x) / 2;
        return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    } else {
        // Curved
        const dx = Math.abs(end.x - start.x);
        const buffer = Math.max(dx * 0.5, 50);
        const cp1 = { x: start.x + buffer, y: start.y };
        const cp2 = { x: end.x - buffer, y: end.y };
        return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
    }
};

export const getPortPosition = (inst: any, template: any, portId: string): Point => {
    const port = template.ports.find((p: any) => p.id === portId);
    if (!port) return { x: inst.x, y: inst.y };
    
    const w = inst.width || template.width;
    const h = inst.height || template.height;
    
    // Rotation logic
    const r = inst.rotation || 0;
    const rad = r * Math.PI / 180;
    
    // Center relative coords
    const cx = w / 2;
    const cy = h / 2;
    
    // Port relative coords (unrotated)
    let px = (port.x / 100) * w;
    const py = (port.y / 100) * h;
    
    if (inst.mirrored) {
        px = w - px;
    }
    
    // Translate to origin
    const ox = px - cx;
    const oy = py - cy;
    
    // Rotate
    const rx = ox * Math.cos(rad) - oy * Math.sin(rad);
    const ry = ox * Math.sin(rad) + oy * Math.cos(rad);
    
    // Initial instance position + rotated offset + center offset (implied?)
    // Actually inst.x/y is usually top-left.
    // So Center of instance in world = inst.x + cx, inst.y + cy
    
    const worldCx = inst.x + cx;
    const worldCy = inst.y + cy;
    
    return {
        x: worldCx + rx,
        y: worldCy + ry
    };
};

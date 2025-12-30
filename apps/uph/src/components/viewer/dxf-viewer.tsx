import React, { useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';
import DxfParser from 'dxf-parser';

interface DxfViewerProps {
  fileUrl: string; // Blob URL or public URL
  content?: string; // Direct text content
}

interface DxfEntity {
  type: string;
  vertices: { x: number; y: number; z?: number }[];
  center?: { x: number; y: number; z?: number };
  radius?: number;
  shape?: boolean;
  [key: string]: unknown; 
}

const DxfModel = ({ fileContent }: { fileContent: string }) => {
  const geometry = useMemo(() => {
    const parser = new DxfParser();
    try {
      const dxf = parser.parseSync(fileContent) as { entities: unknown[] } | null;
      const group = new THREE.Group();

      if (!dxf || !dxf.entities) return group;

      dxf.entities.forEach((entity: unknown) => {
        const ent = entity as DxfEntity;
        if (ent.type === 'LINE') {
          const points = [];
          points.push(new THREE.Vector3(ent.vertices[0].x, ent.vertices[0].y, ent.vertices[0].z || 0));
          points.push(new THREE.Vector3(ent.vertices[1].x, ent.vertices[1].y, ent.vertices[1].z || 0));
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ color: 0xffffff });
          const line = new THREE.Line(geometry, material);
          group.add(line);
        }
        else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
            const points: THREE.Vector3[] = [];
            ent.vertices.forEach((v) => {
                points.push(new THREE.Vector3(v.x, v.y, v.z || 0));
            });
            if (ent.shape) { // Closed loop
                points.push(new THREE.Vector3(ent.vertices[0].x, ent.vertices[0].y, ent.vertices[0].z || 0));
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Polylines in green
            const line = new THREE.Line(geometry, material);
            group.add(line);
        }
        else if (ent.type === 'CIRCLE') {
            if (ent.radius !== undefined && ent.center) { // Type guard
                const geometry = new THREE.CircleGeometry(ent.radius, 32);
                if (geometry.attributes.position) {
                     const curve = new THREE.EllipseCurve(
                        ent.center.x,  ent.center.y,
                        ent.radius, ent.radius,
                        0,  2 * Math.PI,
                        false,
                        0
                    );
                    const pts = curve.getPoints(50);
                    const buffGeom = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, p.y, 0)));
                    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
                    const line = new THREE.Line(buffGeom, material);
                    line.position.z = ent.center.z || 0;
                    group.add(line);
                }
            }
        }
      });

      return group;
    } catch (err) {
      console.error('DXF Parse Error', err);
      return new THREE.Group();
    }
  }, [fileContent]);

  return <primitive object={geometry} />;
};

export default function DxfViewer({ fileUrl, content }: DxfViewerProps) {
  const [text, setText] = useState<string | null>(content || null);

  useEffect(() => {
    if (fileUrl && !content) {
      fetch(fileUrl)
        .then(res => res.text())
        .then(setText)
        .catch(console.error);
    }
  }, [fileUrl, content]);

  if (!text) return <div className="text-white">Loading DXF...</div>;

  return (
    <div className="h-full w-full bg-[#1a1a1a] rounded-lg overflow-hidden relative">
        <div className="absolute top-2 right-2 z-10 bg-black/50 p-2 rounded text-xs text-white">
            Simple DXF Viewer (Lines/Polylines/Circles)
        </div>
      <Canvas camera={{ position: [0, 0, 100], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Center>
            <DxfModel fileContent={text} />
        </Center>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryStore } from '@/stores/inventory-store';
import { Product } from '@/types/inventory';


// Mock Projects
const PROJECTS = [
    { id: 'p1', name: 'Robot Arm Prototype' },
    { id: 'p2', name: 'Home Automation System' },
    { id: 'p3', name: 'Drone Build V2' },
];

interface AssignProjectDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useTranslations } from 'next-intl';

export function AssignProjectDialog({ product, open, onOpenChange }: AssignProjectDialogProps) {
  const t = useTranslations('Inventory.assignProject');
  const { assignToProject } = useInventoryStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const handleAssign = () => {
      const project = PROJECTS.find(p => p.id === selectedProjectId);
      if (!project) return;

      if (quantity > product.stock) {
           alert(t('insufficientStock')); 
           return;
      }

      assignToProject(product.id, project.id, project.name, quantity, 'Current User');
      onOpenChange(false);
      
      // Reset
      setSelectedProjectId('');
      setQuantity(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t.rich('description', {
                name: product.name,
                strong: (chunks) => <strong>{chunks}</strong>
            })}
            <br />
            {t('availableStock')}: {product.stock}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              {t('project')}
            </Label>
            <div className="col-span-3">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('selectProject')} />
                    </SelectTrigger>
                    <SelectContent>
                        {PROJECTS.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              {t('quantity')}
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAssign} disabled={!selectedProjectId || quantity <= 0}>{t('submit')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

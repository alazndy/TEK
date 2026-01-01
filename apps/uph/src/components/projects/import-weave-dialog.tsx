
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjectStore } from '@/stores/project-store';
import { parseWeaveBOM, WeaveBOMItem } from '@/lib/weave';
import { CheckCircle2, Upload, AlertCircle, Loader2, FileJson } from 'lucide-react';
import { toast } from 'sonner';

interface ImportWeaveDialogProps {
  projectId: string;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ImportWeaveDialog({ projectId, onOpenChange, trigger }: ImportWeaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<WeaveBOMItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const { addTask } = useProjectStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedItems = parseWeaveBOM(content);
        setItems(parsedItems);
        toast.success(`${parsedItems.length} components found in BOM`);
      } catch (error) {
        toast.error('Failed to parse BOM file');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (items.length === 0) return;

    setIsImporting(true);
    try {
      // Create a parent task for the BOM import
      const parentTaskId = crypto.randomUUID();
      await addTask(projectId, {
        id: parentTaskId,
        title: `Weave BOM Import: ${fileName}`,
        description: `Imported from Weave design on ${new Date().toLocaleDateString()}`,
        status: 'todo',
        priority: 'medium',
        completed: false
      });

      // Create subtasks for each component
      // Note: In a real app, we might want to batch this or allow selecting specific items
      let count = 0;
      for (const item of items) {
        await addTask(projectId, {
          title: `Sourcing: ${item.quantity}x ${item.component}`,
          description: `Package: ${item.package}\nDesignator: ${item.designator}\nSupplier Part: ${item.supplierPartNumber || 'N/A'}`,
          status: 'todo',
          priority: 'medium',
          completed: false,
          // In a real implementation, we would link this to the parentTaskId if the store supports hierarchy
        });
        count++;
      }

      toast.success(`${count} sourcing tasks created`);
      setOpen(false);
      onOpenChange?.(false);
      
      // Reset state
      setItems([]);
      setFileName('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to import tasks');
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
    if (!newOpen) {
      // Optional: clear state on close?
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
            <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Weave BOM Import
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-violet-500" />
            Import Weave BOM
          </DialogTitle>
          <DialogDescription>
            Upload a JSON BOM file exported from Weave to generate sourcing tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="bom-file">BOM File (JSON)</Label>
            <Input id="bom-file" type="file" accept=".json" onChange={handleFileChange} disabled={isImporting} />
          </div>

          {isLoading && (
              <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
          )}

          {items.length > 0 && (
            <div className="border rounded-md">
                <div className="bg-muted px-4 py-2 border-b flex justify-between items-center text-sm font-medium">
                    <span>Preview: {items.length} Items</span>
                </div>
                <ScrollArea className="h-[200px]">
                    <div className="p-2 space-y-1">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm p-2 hover:bg-muted/50 rounded">
                                <div className="font-medium truncate max-w-[300px]">{item.component}</div>
                                <div className="text-muted-foreground ml-auto flex gap-4">
                                    <span>{item.package}</span>
                                    <span>x{item.quantity}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={items.length === 0 || isImporting}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

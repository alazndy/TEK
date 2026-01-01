
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileJson, AlertTriangle, CheckCircle, Upload } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';

interface ImportTasksDialogProps {
    projectId: string;
}

export function ImportTasksDialog({ projectId }: ImportTasksDialogProps) {
    const [open, setOpen] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [preview, setPreview] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { addTask } = useProjectStore();

    const handleParse = () => {
        try {
            setError(null);
            if (!jsonInput.trim()) return;
            
            const parsed = JSON.parse(jsonInput);
            
            // Handle T-SA Format vs Raw Array
            const tasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
            
            if (!Array.isArray(tasks) || tasks.length === 0) {
                throw new Error("Geçerli bir görev listesi bulunamadı. JSON formatını kontrol edin.");
            }

            setPreview(tasks);
        } catch (e: any) {
            setError(e.message || "JSON ayrıştırma hatası.");
            setPreview([]);
        }
    };

    const handleImport = async () => {
        if (preview.length === 0) return;

        for (const task of preview) {
            await addTask(projectId, {
                title: task.title || "Adsız Görev",
                description: task.description || "",
                completed: false,
                status: 'todo',
                priority: task.priority || 'medium',
                tags: task.tags || []
            });
        }

        setOpen(false);
        setJsonInput('');
        setPreview([]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>JSON İçe Aktar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Görevleri İçe Aktar</DialogTitle>
                    <DialogDescription>
                        T-SA veya Weave'den dışa aktarılan JSON verisini buraya yapıştırın.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <Textarea 
                        placeholder='{ "tasks": [ ... ] }' 
                        className="h-[150px] font-mono text-xs"
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                    />
                    
                    <div className="flex justify-end">
                        <Button variant="secondary" size="sm" onClick={handleParse} disabled={!jsonInput}>
                            Önizle
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Hata</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {preview.length > 0 && (
                        <div className="border rounded-md p-4">
                            <h4 className="mb-2 text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {preview.length} adet görev bulundu
                            </h4>
                            <ScrollArea className="h-[200px]">
                                <div className="space-y-2">
                                    {preview.map((t, i) => (
                                        <div key={i} className="text-sm border p-2 rounded bg-muted/50">
                                            <div className="font-bold flex justify-between">
                                                <span>{t.title}</span>
                                                <span className="text-xs uppercase text-muted-foreground">{t.priority}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                {t.description}
                                            </div>
                                            {t.tags && (
                                                <div className="flex gap-1 mt-2">
                                                    {t.tags.map((tag: string) => (
                                                        <span key={tag} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleImport} disabled={preview.length === 0}>
                        <Upload className="mr-2 h-4 w-4" />
                        İçe Aktar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


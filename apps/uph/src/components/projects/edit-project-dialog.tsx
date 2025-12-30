'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStore } from '@/stores/project-store';
import { Project, ProjectStatus } from '@/types/project';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EditProjectDialogProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
  const t = useTranslations('Projects');
  const { updateProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Project>>({});

  useEffect(() => {
    if (project) {
        setFormData({
            name: project.name,
            description: project.description,
            scope: project.scope || '',
            status: project.status,
            priority: project.priority,
            startDate: project.startDate,
            deadline: project.deadline,
            budget: project.budget,
            manager: project.manager,
            tags: project.tags,
            color: project.color || '#3b82f6',
            logoUrl: project.logoUrl || ''
        });
    }
  }, [project, open]);

  const presetColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
  ];

  const handleSubmit = async () => {
      setLoading(true);
      try {
        await updateProject(project.id, formData);
        onOpenChange(false);
      } catch (error) {
          console.error("Error updating project:", error);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('editProject')}</DialogTitle>
          <DialogDescription>
            {t('editDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              {t('name')}
            </Label>
            <Input
              id="edit-name"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              {t('description')}
            </Label>
             <Input 
              id="edit-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-scope" className="text-right pt-2">
              {t('scope')}
            </Label>
             <Textarea 
              id="edit-scope"
              placeholder={t('scopePlaceholder')}
              value={formData.scope || ''}
              onChange={(e) => setFormData({...formData, scope: e.target.value})}
              className="col-span-3 min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="edit-status" className="text-right">{t('status')}</Label>
             <div className="col-span-3">
                <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v as ProjectStatus})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
             </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-deadline" className="text-right">
              {t('deadline')}
            </Label>
            <Input
              id="edit-deadline"
              type="date"
              value={formData.deadline || ''}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-budget" className="text-right">
              {t('budget')} ($)
            </Label>
            <Input
              id="edit-budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t('color')}</Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`h-6 w-6 rounded-full border-2 transition-all bg-[${color.value}] ${formData.color === color.value ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  onClick={() => setFormData({...formData, color: color.value})}
                  title={color.name}
                />
              ))}
              <Input 
                type="color" 
                className="h-6 w-10 p-0 border-none bg-transparent cursor-pointer"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-logoUrl" className="text-right">
              {t('logoUrl')}
            </Label>
            <Input
              id="edit-logoUrl"
              value={formData.logoUrl}
              onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
              className="col-span-3"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={loading || !formData.name}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

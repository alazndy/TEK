'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStore } from '@/stores/project-store';
import { useAuthStore } from '@/stores/auth-store';
import { Plus } from 'lucide-react';
import { ProjectPriority, ProjectStatus } from '@/types/project';
import { useTranslations } from 'next-intl';

// We might need to install Textarea if missing. Using Input as fallback for now if simple.
// Actually standard shadcn has textarea.

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
}

export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const t = useTranslations('Projects');
  const { addProject } = useProjectStore();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
      name: '',
      description: '',
      status: 'Planning' as ProjectStatus,
      priority: 'Medium' as ProjectPriority,
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      budget: 0,
      manager: 'Turhan', // Default
      tags: [] as string[],
      teamGroupId: undefined as string | undefined,
      color: '#3b82f6',
      logoUrl: '/logo.png'
  });

  const { teamGroups } = useAuthStore();

  const handleSubmit = () => {
      addProject(formData);
      setOpen(false);
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'Planning',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        deadline: '',
        budget: 0,
        manager: 'Turhan',
        tags: [] as string[],
        teamGroupId: undefined,
        color: '#3b82f6',
        logoUrl: '/logo.png'
      });
  };

  const presetColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary-hover text-white rounded-full px-6 py-5 h-auto text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 gap-2">
            <Plus className="h-4 w-4" />
            {t('addNewProject')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-morph bg-[#0d0b11] border-white/10 p-0 overflow-hidden max-w-2xl">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-8">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl rounded-full -mr-16 -mt-16 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-black">{t('addNewProject')}</DialogTitle>
          <DialogDescription className="text-[#a69db9] text-sm">
            {t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
              {t('name')}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-white/5 border-white/10 rounded-2xl text-white placeholder-[#a69db9] focus:bg-white/10 focus:border-primary/50 transition-all"
              placeholder="Project Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
              {t('description')}
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-white/5 border-white/10 rounded-2xl text-white placeholder-[#a69db9] focus:bg-white/10 focus:border-primary/50 transition-all"
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">{t('status')}</Label>
              <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({...formData, status: v as ProjectStatus})}
              >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-primary/50 transition-all">
                      <SelectValue placeholder={t('selectStatus')} />
                  </SelectTrigger>
                  <SelectContent className="glass-morph bg-[#1a1821] border-white/10 text-white">
                      <SelectItem value="Planning" className="focus:bg-white/5">Planning</SelectItem>
                      <SelectItem value="Active" className="focus:bg-white/5">Active</SelectItem>
                      <SelectItem value="On Hold" className="focus:bg-white/5">On Hold</SelectItem>
                      <SelectItem value="Completed" className="focus:bg-white/5">Completed</SelectItem>
                  </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">{t('team')}</Label>
              <Select 
                  value={formData.teamGroupId || "personal"} 
                  onValueChange={(v) => setFormData({...formData, teamGroupId: v === "personal" ? undefined : v})}
              >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-primary/50 transition-all">
                      <SelectValue placeholder={t('selectTeam')} />
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-[#1a1821] border-white/10 text-white">
                      <SelectItem value="personal" className="focus:bg-white/5">Personal (Only Me)</SelectItem>
                      {teamGroups.map(group => (
                          <SelectItem key={group.id} value={group.id} className="focus:bg-white/5">{group.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
                {t('deadline')}
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="bg-white/5 border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-primary/50 transition-all scheme-dark"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
                {t('budget')} ($)
              </Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
                className="bg-white/5 border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-primary/50 transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">{t('color')}</Label>
            <div className="flex flex-wrap gap-3 p-1">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`h-7 w-7 rounded-full border-2 transition-all bg-[${color.value}] ${formData.color === color.value ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  onClick={() => setFormData({...formData, color: color.value})}
                  title={color.name}
                />
              ))}
              <div className="relative h-7 w-7 rounded-full border border-white/10 overflow-hidden ring-offset-[#1a1821] focus-within:ring-2 focus-within:ring-primary">
                <Input 
                  type="color" 
                  className="absolute inset-0 h-[150%] w-[150%] -translate-x-1/4 -translate-y-1/4 p-0 border-none bg-transparent cursor-pointer"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
              {t('logoUrl')} (Optional)
            </Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
              className="bg-white/5 border-white/10 rounded-2xl text-white placeholder-[#a69db9] focus:bg-white/10 focus:border-primary/50 transition-all"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>
    </ScrollArea>

      <div className="p-8 pt-0 relative z-10">
        <Button 
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-6 text-sm font-bold uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
          onClick={handleSubmit} 
          disabled={!formData.name}
        >
          {t('addNewProject')}
        </Button>
      </div>
      </DialogContent>
    </Dialog>
  );
}

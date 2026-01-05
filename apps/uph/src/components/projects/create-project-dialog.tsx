'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectInput, ProjectStatusEnum, ProjectPriorityEnum } from '@/lib/validators';
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
import { useTranslations } from 'next-intl';

interface CreateProjectDialogProps {
  trigger?: React.ReactNode;
}

export function CreateProjectDialog({ trigger }: CreateProjectDialogProps) {
  const t = useTranslations('Projects');
  const { addProject } = useProjectStore();
  const [open, setOpen] = useState(false);
  const { teamGroups } = useAuthStore();
  
  const { 
    register, 
    handleSubmit, 
    control,
    reset,
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<any>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Planning',
      priority: 'Medium',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      budget: 0,
      manager: 'Turhan',
      tags: [],
      teamGroupId: undefined,
      color: '#3b82f6',
      logoUrl: '/logo.png'
    }
  });

  // Watch color for visual feedback
  const watchedColor = watch('color');

  const onSubmit = (data: ProjectInput) => {
    // Transform Zod output back to store expected format if needed
    // Assuming store accepts partial matches or we cast it
    addProject(data as any); 
    setOpen(false);
    reset();
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6 relative z-10">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
                  {t('name')}
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  className={`bg-white/5 border rounded-2xl text-white placeholder-[#a69db9] focus:bg-white/10 transition-all ${errors.name ? 'border-red-500' : 'border-white/10 focus:border-primary/50'}`}
                  placeholder="Project Name"
                />
                {errors.name && <p className="text-red-500 text-xs ml-1">{(errors.name as any).message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
                  {t('description')}
                </Label>
                <Input
                  id="description"
                  {...register('description')}
                  className="bg-white/5 border-white/10 rounded-2xl text-white placeholder-[#a69db9] focus:bg-white/10 focus:border-primary/50 transition-all"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">{t('status')}</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-white/5 border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-primary/50 transition-all">
                          <SelectValue placeholder={t('selectStatus')} />
                        </SelectTrigger>
                        <SelectContent className="glass-morph bg-[#1a1821] border-white/10 text-white">
                            {ProjectStatusEnum.options.map(status => (
                                <SelectItem key={status} value={status} className="focus:bg-white/5">{status}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Team */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">{t('team')}</Label>
                  <Controller
                    control={control}
                    name="teamGroupId"
                    render={({ field }) => (
                      <Select 
                        value={field.value || "personal"} 
                        onValueChange={(v) => field.onChange(v === "personal" ? undefined : v)}
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
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Deadline */}
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
                    {t('deadline')}
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    {...register('deadline')}
                    className="bg-white/5 border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-primary/50 transition-all scheme-dark"
                  />
                </div>
                {/* Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
                    {t('budget')} ($)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    {...register('budget')}
                    className="bg-white/5 border-white/10 rounded-2xl text-white focus:bg-white/10 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>
              
              {/* Color */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">{t('color')}</Label>
                <div className="flex flex-wrap gap-3 p-1">
                  <Controller 
                    control={control}
                    name="color"
                    render={({ field }) => (
                      <>
                        {presetColors.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            className={`h-7 w-7 rounded-full border-2 transition-all bg-[${c.value}] ${field.value === c.value ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            onClick={() => field.onChange(c.value)}
                            title={c.name}
                          />
                        ))}
                        <div className="relative h-7 w-7 rounded-full border border-white/10 overflow-hidden ring-offset-[#1a1821] focus-within:ring-2 focus-within:ring-primary">
                            <Input 
                                type="color"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="absolute inset-0 h-[150%] w-[150%] -translate-x-1/4 -translate-y-1/4 p-0 border-none bg-transparent cursor-pointer"
                            />
                        </div>
                      </>
                    )}
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-[10px] font-black uppercase tracking-widest text-[#a69db9] ml-1">
                  {t('logoUrl')} (Optional)
                </Label>
                <Input
                  id="logoUrl"
                  {...register('logoUrl')}
                  className="bg-white/5 border-white/10 rounded-2xl text-white placeholder-[#a69db9] focus:bg-white/10 focus:border-primary/50 transition-all"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              {/* Submit */}
               <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white rounded-full py-6 text-sm font-bold uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
                disabled={isSubmitting}
              >
                {t('addNewProject')}
              </Button>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

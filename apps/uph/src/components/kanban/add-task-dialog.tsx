'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKanbanStore, TaskStatus } from '@/stores/kanban-store';
import { useProjectStore } from '@/stores/project-store';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['backlog', 'todo', 'in-progress', 'review', 'done']),
  projectId: z.string().min(1, 'Project is required'),
});

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: TaskStatus;
}

import { useTranslations } from 'next-intl';

export function AddTaskDialog({ open, onOpenChange, defaultStatus = 'todo' }: AddTaskDialogProps) {
  const t = useTranslations('Kanban');
  const tCommon = useTranslations('Common');
  const { addTask } = useKanbanStore();
  const { projects, fetchProjects } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  // ... (keep logic) ...

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: defaultStatus,
      projectId: '',
    },
  });

  // ... (keep useEffect and logic) ...
  useEffect(() => {
      if (open) {
          fetchProjects();
      }
  }, [open, fetchProjects]);

  // Update form when defaultStatus changes
  if (form.getValues('status') !== defaultStatus && open) {
    form.setValue('status', defaultStatus);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await addTask(values.projectId, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
      });
      form.reset();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addTask')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             {/* Project Selection */}
             <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.project')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.selectProject')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {projects.map(project => (
                             <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.titlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.description')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('form.descriptionPlaceholder')} 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.priority')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.selectPriority')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">{t('priorities.low')}</SelectItem>
                        <SelectItem value="medium">{t('priorities.medium')}</SelectItem>
                        <SelectItem value="high">{t('priorities.high')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.status')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.selectStatus')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">{t('todo')}</SelectItem>
                        <SelectItem value="in-progress">{t('inProgress')}</SelectItem>
                        <SelectItem value="review">{t('review')}</SelectItem>
                        <SelectItem value="done">{t('done')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('addTask')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

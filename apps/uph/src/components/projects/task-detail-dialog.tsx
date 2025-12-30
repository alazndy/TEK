'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Calendar, 
    CheckSquare, 
    MessageSquare, 
    User, 
    Clock, 
    Trash2, 
    Plus,
    X
} from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { useProjectStore } from '@/stores/project-store';
import { formatDistanceToNow } from 'date-fns';

interface TaskDetailDialogProps {
    projectId: string;
    task: ProjectTask;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ projectId, task, open, onOpenChange }: TaskDetailDialogProps) {
    const { 
        addSubtask, 
        toggleSubtask, 
        deleteSubtask, 
        addComment, 
        deleteComment 
    } = useProjectStore();

    const [newSubtask, setNewSubtask] = useState('');
    const [newComment, setNewComment] = useState('');

    const handleAddSubtask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubtask.trim()) return;
        await addSubtask(projectId, task.id, newSubtask);
        setNewSubtask('');
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        await addComment(projectId, task.id, newComment);
        setNewComment('');
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors = {
            'todo': 'bg-slate-500',
            'in-progress': 'bg-blue-500',
            'review': 'bg-purple-500',
            'done': 'bg-green-500'
        };
        return (
            <Badge className={`${colors[status as keyof typeof colors] || 'bg-slate-500'} capitalize`}>
                {status.replace('-', ' ')}
            </Badge>
        );
    };

    // Calculate progress
    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
    const progress = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <StatusBadge status={task.status} />
                                <span className="text-xs text-muted-foreground font-mono">#{task.id.slice(-4)}</span>
                            </div>
                            <DialogTitle className="text-xl leading-none">{task.title}</DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2">
                    <div className="grid grid-cols-3 gap-8 h-full">
                        {/* Left Column: Details & Subtasks */}
                        <div className="col-span-2 space-y-6">
                            
                            {/* Description (Placeholder for now) */}
                            <div className="text-sm text-muted-foreground">
                                {task.description || "No description provided."}
                            </div>

                            <Separator />

                            {/* Subtasks Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium flex items-center gap-2">
                                        <CheckSquare className="h-4 w-4" /> 
                                        Subtasks
                                        {totalSubtasks > 0 && <span className="text-xs font-normal text-muted-foreground">({progress}%)</span>}
                                    </h4>
                                </div>
                                
                                {/* Progress Bar */}
                                {totalSubtasks > 0 && (
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {task.subtasks?.map(subtask => (
                                        <div key={subtask.id} className="flex items-center group">
                                            <Checkbox 
                                                checked={subtask.completed} 
                                                onCheckedChange={() => toggleSubtask(projectId, task.id, subtask.id)}
                                                className="mr-3"
                                            />
                                            <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {subtask.title}
                                            </span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => deleteSubtask(projectId, task.id, subtask.id)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
                                    <Input 
                                        placeholder="Add a subtask..." 
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                    <Button type="submit" size="sm" variant="secondary" className="h-8">
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </form>
                            </div>

                            <Separator />

                            {/* Activity / Comments */}
                            <div className="space-y-4">
                                <h4 className="font-medium flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" /> 
                                    Sembolik Yorumlar (Team)
                                </h4>
                                
                                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                    <div className="space-y-4">
                                        {task.comments?.map(comment => (
                                            <div key={comment.id} className="flex gap-3 text-sm">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">
                                                        {comment.userName?.slice(0, 2).toUpperCase() || 'US'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-xs">{comment.userName || 'User'}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-4 w-4 ml-1 hover:text-destructive"
                                                                onClick={() => deleteComment(projectId, task.id, comment.id)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </span>
                                                    </div>
                                                    <p className="text-zinc-300">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!task.comments || task.comments.length === 0) && (
                                            <div className="text-center text-xs text-muted-foreground py-8">
                                                Henüz yorum yok. İlk yorumu sen yap.
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="flex gap-2">
                                    <Textarea 
                                        placeholder="Bir yorum yaz..." 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button size="sm" onClick={handleAddComment}>
                                        Yorum Ekle
                                    </Button>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Meta */}
                        <div className="col-span-1 space-y-6 border-l pl-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h5 className="text-xs font-medium text-muted-foreground uppercase">Assignee</h5>
                                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback>UN</AvatarFallback>
                                        </Avatar>
                                        <span>Unassigned</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h5 className="text-xs font-medium text-muted-foreground uppercase">Due Date</h5>
                                    <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded-md">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>No date set</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h5 className="text-xs font-medium text-muted-foreground uppercase">Created</h5>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>Just now</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

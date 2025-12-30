import React, { useState } from 'react';
import { PremiumModal } from '../ui/PremiumModal';
import { KanbanSquare, Plus, MoreHorizontal, Clock, CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
}

interface ProjectBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Şema Tasarımı', status: 'in-progress', priority: 'high', assignee: 'Ali' },
  { id: '2', title: 'Malzeme Listesi Onayı', status: 'todo', priority: 'medium' },
  { id: '3', title: 'Müşteri Görüşmesi', status: 'done', priority: 'high', assignee: 'Ayşe' }
];

export const ProjectBoardModal: React.FC<ProjectBoardModalProps> = ({ isOpen, onClose }) => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'done': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
    }
  };

  const renderColumn = (title: string, status: Task['status'], icon: React.ReactNode) => (
    <div className="flex-1 min-w-[300px] bg-zinc-50/50 dark:bg-black/20 rounded-2xl border border-zinc-200 dark:border-white/5 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-white/5">
        <div className="flex items-center gap-2 font-bold text-sm text-zinc-700 dark:text-zinc-300">
          {icon}
          {title}
          <span className="bg-zinc-200 dark:bg-white/10 text-xs px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400">
            {tasks.filter(t => t.status === status).length}
          </span>
        </div>
        <button className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1">
        {tasks.filter(t => t.status === status).map(task => (
          <div key={task.id} className="p-4 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5 rounded-xl cursor-pointer group transition-all hover:border-pilabaster dark:hover:border-white/10 hover:shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
              </span>
              <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={14} />
              </button>
            </div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">{task.title}</h4>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-white/5">
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white">
                    {task.assignee[0]}
                  </div>
                  <span className="text-xs text-zinc-500">{task.assignee}</span>
                </div>
              ) : (
                <span className="text-xs text-zinc-600 italic">Atanmamış</span>
              )}
              {status === 'in-progress' && <Clock size={12} className="text-blue-400/50" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PremiumModal
        isOpen={isOpen}
        onClose={onClose}
        title="Proje Panosu"
        icon={<KanbanSquare className="text-purple-400 w-5 h-5" />}
        width="max-w-6xl"
    >
      <div className="flex gap-4 p-2 h-[600px] overflow-x-auto pb-4">
        {renderColumn('Yapılacaklar', 'todo', <Circle size={14} className="text-zinc-400" />)}
        {renderColumn('Devam Edenler', 'in-progress', <Clock size={14} className="text-blue-400" />)}
        {renderColumn('Tamamlananlar', 'done', <CheckCircle2 size={14} className="text-emerald-400" />)}
      </div>
    </PremiumModal>
  );
};

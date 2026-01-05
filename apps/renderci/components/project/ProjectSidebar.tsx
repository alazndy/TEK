import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, Plus, Search, MoreVertical, Trash2, 
  Edit2, Clock, Image, ChevronRight, X, FolderPlus 
} from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { RenderProject } from '../../types/project';
import { cn } from '../../lib/utils';

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect?: (project: RenderProject) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ 
  isOpen, 
  onClose, 
  onProjectSelect 
}) => {
  const { 
    projects, 
    activeProjectId, 
    createProject, 
    deleteProject, 
    setActiveProject,
    getRecentProjects 
  } = useProjectStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const recentProjects = getRecentProjects(3);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const project = createProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
      onProjectSelect?.(project);
    }
  };

  const handleSelectProject = (project: RenderProject) => {
    setActiveProject(project.id);
    onProjectSelect?.(project);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Bugün';
    if (days === 1) return 'Dün';
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900 border-r border-white/10 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Projeler</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Proje ara..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* New Project Button */}
            <div className="px-4 mb-4">
              {isCreating ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    placeholder="Proje adı..."
                    autoFocus
                    className="flex-1 px-3 py-2 bg-slate-800 border border-primary rounded-xl text-sm focus:outline-none"
                  />
                  <button
                    onClick={handleCreateProject}
                    className="px-3 py-2 bg-primary rounded-xl text-sm font-medium hover:bg-primary/80 transition-colors"
                  >
                    Oluştur
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/30 rounded-xl text-primary font-medium hover:bg-primary/20 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  Yeni Proje
                </button>
              )}
            </div>

            {/* Recent Projects */}
            {recentProjects.length > 0 && !searchQuery && (
              <div className="px-4 mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Son Kullanılanlar
                </h3>
                <div className="space-y-1">
                  {recentProjects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleSelectProject(project)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors",
                        activeProjectId === project.id 
                          ? "bg-primary/20 text-primary" 
                          : "hover:bg-white/5"
                      )}
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm truncate">{project.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Project List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tüm Projeler ({filteredProjects.length})
              </h3>
              
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Henüz proje yok</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProjects.map(project => (
                    <motion.div
                      key={project.id}
                      layout
                      className={cn(
                        "group p-3 rounded-xl border transition-all cursor-pointer",
                        activeProjectId === project.id 
                          ? "bg-primary/10 border-primary/50" 
                          : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                      )}
                      onClick={() => handleSelectProject(project)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {project.thumbnail ? (
                            <img 
                              src={project.thumbnail} 
                              alt={project.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="w-5 h-5 text-slate-500" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{project.name}</h4>
                          <p className="text-xs text-slate-400">
                            {project.renders.length} render • {formatDate(project.updatedAt)}
                          </p>
                          {project.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {project.tags.slice(0, 2).map(tag => (
                                <span 
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 bg-slate-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(project.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/10"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
                                deleteProject(project.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500">
                {projects.length} proje • {projects.reduce((acc, p) => acc + p.renders.length, 0)} render
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

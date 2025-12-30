'use client';

import { useProjectStore } from '@/stores/project-store';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { EditProjectDialog } from '@/components/projects/edit-project-dialog';
import { Project } from '@/types/project';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Target, Clock, Star } from 'lucide-react';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';

// Sub-components
import { ProjectToolbar } from '@/components/projects/list/project-toolbar';
import { ProjectCard } from '@/components/projects/list/project-card';
import { ProjectListItem } from '@/components/projects/list/project-list-item';

export default function ProjectsPage() {
    const { projects, fetchProjects, deleteProject, updateProject, isLoading } = useProjectStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const t = useTranslations('Projects');

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleEditClick = (project: Project) => {
        setSelectedProject(project);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = (project: Project) => {
        setSelectedProject(project);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedProject) {
            await deleteProject(selectedProject.id);
            setDeleteDialogOpen(false);
            setSelectedProject(null);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent, project: Project) => {
        e.preventDefault();
        e.stopPropagation();
        await updateProject(project.id, { isFavorite: !project.isFavorite });
    };

    const filteredProjects = projects
       .filter(project => 
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
       )
       .sort((a, b) => {
           if (a.isFavorite && !b.isFavorite) return -1;
           if (!a.isFavorite && b.isFavorite) return 1;
           return a.name.localeCompare(b.name);
       });

    return (
        <div className="flex-1 flex flex-col min-h-full">
            {/* Background Ambient Glows */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

            <div className="relative z-10 space-y-8">
                <ProjectToolbar 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    t={t}
                />

                <AnimatePresence mode="popLayout">
                    {viewMode === 'grid' ? (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(350px,1fr))] w-full"
                        >
                            {isLoading && projects.length === 0 ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4 glass-card">
                                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <p className="text-[#a69db9] font-medium animate-pulse">{t('loading')}</p>
                                </div>
                            ) : (
                                <>
                                    {filteredProjects.map((project) => (
                                        <ProjectCard 
                                            key={project.id}
                                            project={project}
                                            t={t}
                                            onEdit={handleEditClick}
                                            onDelete={handleDeleteClick}
                                            onToggleFavorite={toggleFavorite}
                                        />
                                    ))}
                                    <CreateProjectDialog 
                                        trigger={
                                            <motion.button 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="border-2 border-dashed border-white/10 rounded-4xl p-8 flex flex-col items-center justify-center min-h-[280px] text-[#a69db9] hover:text-white hover:border-primary/50 hover:bg-white/5 transition-all group relative overflow-hidden"
                                            >
                                                <div className="size-16 rounded-full bg-[#2e2839] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary transition-all duration-300 shadow-xl">
                                                    <Plus className="h-8 w-8 transition-colors text-white" />
                                                </div>
                                                <span className="font-bold text-lg">{t('addNewProject')}</span>
                                                <span className="text-[10px] font-medium mt-2 text-center opacity-60 uppercase tracking-widest leading-loose">
                                                    Create a new workspace<br/>for your team
                                                </span>
                                            </motion.button>
                                        }
                                    />
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-[#a69db9]">
                                            <th className="px-8 py-6">{t('name')}</th>
                                            <th className="px-6 py-6 font-medium text-center"><Clock className="h-4 w-4 mx-auto" /></th>
                                            <th className="px-6 py-6 font-medium"><Target className="h-4 w-4" /></th>
                                            <th className="px-6 py-6 font-medium text-center"><Star className="h-4 w-4 mx-auto text-[#a69db9]" /></th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProjects.map((project) => (
                                            <ProjectListItem 
                                                key={project.id}
                                                project={project}
                                                onEdit={handleEditClick}
                                                onDelete={handleDeleteClick}
                                                onToggleFavorite={toggleFavorite}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {selectedProject && (
                <>
                    <EditProjectDialog 
                        project={selectedProject} 
                        open={editDialogOpen} 
                        onOpenChange={setEditDialogOpen} 
                    />
                    
                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent className="glass-card bg-[#0d0b11] border-white/10 rounded-4xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-black text-white">{t('deleteConfirmationTitle')}</AlertDialogTitle>
                                <AlertDialogDescription className="text-[#a69db9] text-sm">
                                    {t.rich('deleteConfirmationDesc', {
                                        name: selectedProject.name,
                                        bold: (chunks) => <span className="font-bold text-white underline underline-offset-4 decoration-red-500/50">{chunks}</span>
                                    })}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6">
                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full px-6">{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none rounded-full px-6 shadow-lg shadow-red-600/20">{t('confirmDelete')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}
        </div>
    );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/project-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { useSettingsStore } from '@/stores/settings-store';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Sub-components
import { ProjectHeader } from '@/components/projects/project-detail/project-header';
import { ProjectOverview } from '@/components/projects/project-detail/project-overview';
import { ManagementSection } from '@/components/projects/project-detail/management-section';
import { EngineeringSection } from '@/components/projects/project-detail/engineering-section';
import { FilesSection } from '@/components/projects/project-detail/files-section';
import { RiskSection } from '@/components/projects/project-detail/risk-section';

// Lazy loaded dialogs and assistants
const ConnectGitHubDialog = dynamic(() => import('@/components/projects/connect-github-dialog').then(mod => mod.ConnectGitHubDialog));
const AddInventoryDialog = dynamic(() => import('@/components/projects/add-inventory-dialog').then(mod => mod.AddInventoryDialog));
const AIAssistant = dynamic(() => import('@/components/ai/ai-assistant').then(mod => mod.AIAssistant), { ssr: false });
const EditProjectDialog = dynamic(() => import('@/components/projects/edit-project-dialog').then(mod => mod.EditProjectDialog));

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    
    const { 
        getProject, 
        deleteProject, 
        fetchProjectTasks, 
        fetchProjects, 
        isLoading, 
        syncGitHubIssues, 
        syncProjectReadme,
        addFile 
    } = useProjectStore();
    const project = getProject(id);
    
    const { projectUsages, fetchInventory, products } = useInventoryStore();
    const projectInventory = useMemo(() => 
        projectUsages.filter(u => u.projectId === id && u.status === 'Active'),
        [projectUsages, id]
    );

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [githubDialogOpen, setGithubDialogOpen] = useState(false);
    const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
    
    const { system } = useSettingsStore();

    const weaveEnabled = system.integrations?.weave ?? true;
    const envEnabled = system.integrations?.envInventory ?? true;

    useEffect(() => {
        if (id) {
            fetchProjects();
            fetchInventory();
            fetchProjectTasks(id);
        }
    }, [id, fetchProjects, fetchProjectTasks, fetchInventory]);

    // Ecosystem Integration: Listen for results from T-SA and Renderci
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            const data = event.data;
            if (!data || !data.type) return;

            if (data.type === 'tsa_result' && data.projectId === id) {
                toast.success('T-SA Analiz Sonucu Alındı', {
                    description: 'Analiz raporu projeye kaydediliyor...'
                });
                
                const reportName = `TSA_Analiz_${new Date().toLocaleDateString()}.json`;
                await addFile(id, {
                    name: reportName,
                    type: 'JSON',
                    url: 'data:application/json;base64,' + btoa(JSON.stringify(data.result)),
                    size: JSON.stringify(data.result).length,
                    uploadedAt: new Date().toISOString(),
                    category: 'Reports'
                });
            }

            if (data.type === 'render_result' && data.projectId === id) {
                toast.success('Render Görüntüsü Alındı', {
                    description: 'Görüntü projeye kaydediliyor...'
                });

                const imageName = `Render_${new Date().toLocaleDateString()}_${Math.floor(Math.random() * 1000)}.png`;
                await addFile(id, {
                    name: imageName,
                    type: 'Image',
                    url: data.resultImageUrl,
                    size: data.resultImageUrl.length,
                    uploadedAt: new Date().toISOString(),
                    category: 'Visuals'
                });
            }
        };

        const checkUrlParams = async () => {
            const searchParams = new URLSearchParams(window.location.search);
            const integratedResult = searchParams.get('integrated_result');
            const resultDataRaw = searchParams.get('data');

            if (integratedResult && resultDataRaw) {
                try {
                    const resultData = JSON.parse(decodeURIComponent(resultDataRaw));
                    
                    if (integratedResult === 'tsa') {
                        toast.success('T-SA Analiz Sonucu Alındı (Yönlendirme ile)');
                        await addFile(id, {
                            name: `TSA_Analiz_Redirect_${new Date().toLocaleDateString()}.json`,
                            type: 'JSON',
                            url: 'data:application/json;base64,' + btoa(JSON.stringify(resultData)),
                            size: JSON.stringify(resultData).length,
                            uploadedAt: new Date().toISOString(),
                            category: 'Reports'
                        });
                    } else if (integratedResult === 'render') {
                        toast.success('Render Görüntüsü Alındı (Yönlendirme ile)');
                        await addFile(id, {
                            name: `Render_Redirect_${new Date().toLocaleDateString()}.png`,
                            type: 'Image',
                            url: resultData, // Assuming it's the image URL/data
                            size: resultData.length,
                            uploadedAt: new Date().toISOString(),
                            category: 'Visuals'
                        });
                    }

                    // Clear URL parameters
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, '', newUrl);
                } catch (e) {
                    console.error("Failed to parse integrated result data", e);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        checkUrlParams();

        return () => window.removeEventListener('message', handleMessage);
    }, [id, addFile]);

    const handleDelete = async () => {
        if (project) {
            await deleteProject(project.id);
            router.push('/projects');
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-muted-foreground animate-pulse">Proje verileri yükleniyor...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
                <AlertTriangle className="h-12 w-12 text-yellow-500" />
                <h2 className="text-2xl font-bold">Proje Bulunamadı</h2>
                <p className="text-muted-foreground">Aradığınız proje mevcut değil veya silinmiş olabilir.</p>
                <Button asChild variant="secondary">
                    <Link href="/projects"><ArrowLeft className="mr-2 h-4 w-4"/> Projelere Dön</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6">
            <ProjectHeader 
                project={project}
                onSetGithubOpen={setGithubDialogOpen}
                onSetEditOpen={setEditDialogOpen}
                onSetDeleteOpen={setDeleteDialogOpen}
            />

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
                    <TabsTrigger value="overview">Proje Özeti</TabsTrigger>
                    <TabsTrigger value="management">Yönetim</TabsTrigger>
                    <TabsTrigger value="engineering">Mühendislik</TabsTrigger>
                    <TabsTrigger value="risk">Risk & EVM</TabsTrigger>
                    <TabsTrigger value="files">Dosyalar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <ProjectOverview 
                        project={project}
                        projectInventory={projectInventory}
                        system={system}
                        envEnabled={envEnabled}
                        syncProjectReadme={syncProjectReadme}
                        onSetGithubOpen={setGithubDialogOpen}
                        onSetInventoryOpen={setInventoryDialogOpen}
                    />
                </TabsContent>

                <TabsContent value="management">
                    <ManagementSection 
                        project={project}
                        projectInventory={projectInventory}
                        products={products}
                        system={system}
                        syncGitHubIssues={syncGitHubIssues}
                    />
                </TabsContent>

                <TabsContent value="engineering">
                    <EngineeringSection 
                        project={project}
                        weaveEnabled={weaveEnabled}
                        envEnabled={envEnabled}
                        products={products}
                    />
                </TabsContent>

                <TabsContent value="risk">
                    <RiskSection projectId={id} />
                </TabsContent>

                <TabsContent value="files">
                    <FilesSection project={project} />
                </TabsContent>
            </Tabs>

            {/* Dialogs & Assistants */}
            <EditProjectDialog 
                project={project} 
                open={editDialogOpen} 
                onOpenChange={setEditDialogOpen} 
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your project
                            and remove your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete Project</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ConnectGitHubDialog 
                projectId={project.id}
                projectName={project.name}
                open={githubDialogOpen}
                onOpenChange={setGithubDialogOpen}
            />

            <AddInventoryDialog 
                projectId={project.id}
                projectName={project.name}
                open={inventoryDialogOpen}
                onOpenChange={setInventoryDialogOpen}
            />

            <AIAssistant 
                projectId={project.id}
                projectName={project.name}
                projectDescription={project.description}
            />
        </div>
    );
}

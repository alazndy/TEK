'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ExternalLink, Folder, Package, Loader2 } from 'lucide-react';

// UPH Base URL - update this if deployed elsewhere
const UPH_BASE_URL = 'http://localhost:3000';

interface ProjectUsage {
  id: string;
  projectId: string;
  projectName: string;
  productId: string;
  productName: string;
  quantity: number;
  assignedDate: string;
  assignedBy: string;
  status: 'Active' | 'Consumed' | 'Returned';
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface ProjectWithUsage extends Project {
  usages: ProjectUsage[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsData = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        // Fetch project usages
        const usagesSnapshot = await getDocs(collection(db, 'project_usages'));
        const usagesData = usagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProjectUsage[];

        // Combine projects with their usages
        const projectsWithUsage = projectsData.map(project => ({
          ...project,
          usages: usagesData.filter(u => u.projectId === project.id && u.status === 'Active')
        }));

        // Sort by name
        projectsWithUsage.sort((a, b) => a.name.localeCompare(b.name));

        setProjects(projectsWithUsage);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projeler</h1>
          <p className="text-muted-foreground">
            UPH'tan senkronize edilen projeler ve kullanılan malzemeler
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {projects.length} Proje
        </Badge>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Henüz proje yok</h3>
            <p className="text-sm text-muted-foreground mt-1">
              UPH'ta proje oluşturun, burada görünecektir.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Folder className="h-5 w-5 text-primary" />
                    {project.name}
                  </CardTitle>
                  <CardDescription>
                    {project.description || 'Açıklama yok'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={`${UPH_BASE_URL}/projects/${project.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      UPH'da Aç
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {project.usages.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4 text-center border-t">
                    <Package className="h-5 w-5 mx-auto mb-2 opacity-50" />
                    Bu projede henüz malzeme kullanılmamış
                  </div>
                ) : (
                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Kullanılan Malzemeler ({project.usages.length})
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ürün Adı</TableHead>
                          <TableHead>Miktar</TableHead>
                          <TableHead>Atayan</TableHead>
                          <TableHead>Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.usages.map(usage => (
                          <TableRow key={usage.id}>
                            <TableCell className="font-medium">{usage.productName}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{usage.quantity} adet</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{usage.assignedBy}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(usage.assignedDate).toLocaleDateString('tr-TR')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

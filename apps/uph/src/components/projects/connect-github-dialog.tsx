'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGitHubStore, parseGitHubUrl } from '@/stores/github-store';
import { useProjectStore } from '@/stores/project-store';
import { issuesToTasks } from '@/lib/github';
import { Github, Loader2, Star, GitFork, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectGitHubDialogProps {
  projectId: string;
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectGitHubDialog({ 
  projectId, 
  projectName, 
  open, 
  onOpenChange 
}: ConnectGitHubDialogProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  
  const { isConnecting, error, repoInfo, issues, connectRepo, fetchRepoIssues, clearRepo } = useGitHubStore();
  const { addTask, updateProject } = useProjectStore();

  const handleConnect = async () => {
    const result = await connectRepo(repoUrl);
    if (result) {
      const parsed = parseGitHubUrl(repoUrl);
      if (parsed) {
        await fetchRepoIssues(parsed.owner, parsed.repo);
        setStep('preview');
      }
    }
  };

  const handleSyncIssues = async () => {
    const tasks = issuesToTasks(issues);
    
    // Add each issue as a task
    for (const task of tasks) {
      await addTask(projectId, {
        title: task.title,
        completed: task.completed,
        status: task.status
      });
    }

    // Update project with GitHub info
    await updateProject(projectId, {
      githubRepo: repoInfo?.full_name,
      githubSyncEnabled: true,
      lastGithubSync: new Date().toISOString()
    });

    setStep('success');
    toast.success(`Synced ${tasks.length} issues as tasks`);
    
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setRepoUrl('');
    setStep('input');
    clearRepo();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Connect GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Link a GitHub repository to {projectName} and sync issues as tasks.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/owner/repo or owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleConnect} disabled={!repoUrl || isConnecting}>
                {isConnecting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</>
                ) : (
                  <>Connect</>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'preview' && repoInfo && (
          <div className="space-y-4 py-4">
            {/* Repo Info Card */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{repoInfo.full_name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{repoInfo.description || 'No description'}</p>
                </div>
                <Badge variant="outline">{repoInfo.language || 'Unknown'}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {repoInfo.stargazers_count}</span>
                <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> Open Issues: {repoInfo.open_issues_count}</span>
              </div>
            </div>

            {/* Issues Preview */}
            <div>
              <h4 className="font-medium mb-2">Issues to Sync ({issues.length})</h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-center gap-2 p-2 border rounded text-sm">
                    <Badge variant="secondary" className="font-mono">#{issue.number}</Badge>
                    <span className="truncate">{issue.title}</span>
                  </div>
                ))}
                {issues.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No open issues found</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('input')}>Back</Button>
              <Button onClick={handleSyncIssues}>
                Sync {issues.length} Issues as Tasks
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="font-semibold text-lg">Successfully Connected!</h4>
            <p className="text-muted-foreground mt-1">Issues have been synced as tasks.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

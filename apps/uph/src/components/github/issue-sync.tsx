'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircleDot, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useKanbanStore, TaskStatus } from '@/stores/kanban-store';
import { toast } from 'sonner';

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: { name: string; color: string }[];
  html_url: string;
  created_at: string;
}

interface IssueSyncProps {
  owner: string;
  repo: string;
  token?: string;
  projectId: string;
}

export function IssueSync({ owner, repo, token, projectId }: IssueSyncProps) {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addTask } = useKanbanStore();

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const headers: Record<string, string> = {
          'Accept': 'application/vnd.github.v3+json',
        };
        if (token) {
          headers['Authorization'] = `token ${token}`;
        }
        
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=10`,
          { headers }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }
        
        const data: GitHubIssue[] = await response.json();
        setIssues(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (owner && repo) {
      fetchIssues();
    }
  }, [owner, repo, token]);

  const handleSyncToKanban = (issue: GitHubIssue) => {
    // Determine priority from labels
    const priority = issue.labels.some(l => l.name.toLowerCase().includes('critical') || l.name.toLowerCase().includes('urgent'))
      ? 'high'
      : issue.labels.some(l => l.name.toLowerCase().includes('low'))
        ? 'low'
        : 'medium';

    addTask(projectId, {
      title: `#${issue.number}: ${issue.title}`,
      description: `Synced from GitHub issue. View at: ${issue.html_url}`,
      status: 'todo' as TaskStatus,
      priority,
    });

    toast.success(`Issue #${issue.number} synced to Kanban!`);
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CircleDot className="h-5 w-5 text-green-400" />
            Open Issues
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {issues.length} open
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400 text-sm">
            {error}
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No open issues
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
              >
                <CircleDot className="h-4 w-4 mt-1 text-green-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{issue.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-zinc-500">#{issue.number}</span>
                    {issue.labels.slice(0, 3).map((label) => (
                      <Badge
                        key={label.name}
                        variant="outline"
                        className="text-[10px] px-1"
                        style={{ borderColor: `#${label.color}`, color: `#${label.color}` }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleSyncToKanban(issue)}
                    title="Sync to Kanban"
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                  <Link href={issue.html_url} target="_blank">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

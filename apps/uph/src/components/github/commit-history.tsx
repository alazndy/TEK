'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCommit, GitBranch, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

interface CommitHistoryProps {
  owner: string;
  repo: string;
  token?: string;
}

export function CommitHistory({ owner, repo, token }: CommitHistoryProps) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
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
          `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
          { headers }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch commits');
        }
        
        interface GitHubCommit {
          sha: string;
          commit: {
            message: string;
            author: {
              name: string;
              date: string;
            };
          };
          html_url: string;
        }
        
        const data: GitHubCommit[] = await response.json();
        
        setCommits(data.map(c => ({
          sha: c.sha.substring(0, 7),
          message: c.commit.message.split('\n')[0],
          author: c.commit.author.name,
          date: new Date(c.commit.author.date).toLocaleDateString(),
          url: c.html_url,
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (owner && repo) {
      fetchCommits();
    }
  }, [owner, repo, token]);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-green-400" />
            Recent Commits
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {owner}/{repo}
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
        ) : commits.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No commits found
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {commits.map((commit) => (
              <div
                key={commit.sha}
                className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
              >
                <GitCommit className="h-4 w-4 mt-1 text-zinc-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{commit.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-purple-400">
                      {commit.sha}
                    </code>
                    <span className="text-xs text-zinc-500">{commit.author}</span>
                    <span className="text-xs text-zinc-600">{commit.date}</span>
                  </div>
                </div>
                <Link href={commit.url} target="_blank">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

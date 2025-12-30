"use client";

import { useEffect, useState } from "react";
import { GitBranch, GitPullRequest, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettingsStore } from "@/stores/settings-store";

interface GitHubStatsProps {
    repoUrl?: string;
}

export function GitHubStats({ repoUrl }: GitHubStatsProps) {
    const { system } = useSettingsStore();
    const [stats, setStats] = useState<{ prs: number; issues: number; lastCommit: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!system.integrations.github || !repoUrl) return;

        // Mock API Call
        setTimeout(() => {
            setStats({
                prs: 3,
                issues: 5,
                lastCommit: "2 hours ago"
            });
            setLoading(false);
        }, 1000);

    }, [system.integrations.github, repoUrl]);

    if (!system.integrations.github || !repoUrl) return null;

    if (loading) return <div className="animate-pulse h-24 bg-muted rounded-md" />;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    GitHub Repository
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                        <GitPullRequest className="h-5 w-5 mb-1 text-blue-500" />
                        <span className="text-xl font-bold">{stats?.prs}</span>
                        <span className="text-xs text-muted-foreground">Open PRs</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                        <AlertCircle className="h-5 w-5 mb-1 text-orange-500" />
                        <span className="text-xl font-bold">{stats?.issues}</span>
                        <span className="text-xs text-muted-foreground">Issues</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 mb-1 text-green-500" />
                        <span className="text-xs font-medium mt-1">{stats?.lastCommit}</span>
                        <span className="text-xs text-muted-foreground">Last Commit</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

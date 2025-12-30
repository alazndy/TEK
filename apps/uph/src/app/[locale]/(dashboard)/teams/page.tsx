'use client';

import { useState, useEffect } from "react";
import { useTeamStore } from "@/stores/team-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, Shield, Loader2 } from "lucide-react";
import { CreateTeamDialog } from "@/components/teams/create-team-dialog";

import { useTranslations } from 'next-intl';

export default function TeamsPage() {
    const t = useTranslations('Teams');
    const { user } = useAuthStore();
    const { teams, fetchUserTeams, isLoading, activeTeamId, setActiveTeam } = useTeamStore();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUserTeams(user.uid);
        }
    }, [user, fetchUserTeams]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> {t('createTeam')}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teams.map(team => (
                    <Card key={team.id} className={`transition-all ${activeTeamId === team.id ? 'border-primary ring-1 ring-primary' : 'hover:border-zinc-700'}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold">
                                {team.name}
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="mb-4 min-h-[40px]">
                                {team.description || t('noDescription')}
                            </CardDescription>
                            
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex -space-x-2">
                                    {(team.members || []).slice(0, 4).map((member, i) => (
                                        <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                            <AvatarImage src={member.photoURL} />
                                            <AvatarFallback>{member.displayName?.charAt(0) || '?'}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {(team.members?.length || 0) > 4 && (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                            +{(team.members?.length || 0) - 4}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t('members', {count: team.members?.length || 0})}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Button 
                                    className="w-full" 
                                    variant={activeTeamId === team.id ? "secondary" : "default"}
                                    onClick={() => setActiveTeam(team.id)}
                                >
                                    {activeTeamId === team.id ? t('active') : t('select')}
                                </Button>
                                <Button variant="outline" className="px-3">
                                    <Shield className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {teams.length === 0 && (
                     <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg border-zinc-800 bg-zinc-900/50">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">{t('empty.title')}</h3>
                        <p className="text-muted-foreground text-center max-w-sm mb-6">
                            {t('empty.description')}
                        </p>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            {t('empty.button')}
                        </Button>
                     </div>
                )}
            </div>

            <CreateTeamDialog 
                open={createDialogOpen} 
                onOpenChange={setCreateDialogOpen} 
            />
        </div>
    );
}

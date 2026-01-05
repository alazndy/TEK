'use client';

import { useState } from 'react';
import { useTeamStore } from '@/stores/team-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from '@/types';
import { 
  Users, 
  Mail, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  User as UserIcon,
  MoreVertical,
  Plus,
  Layers,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TeamSettings() {
    const { 
        teams, addMember, removeMember, activeTeamId, fetchUserTeams,
        createTeam, updateMemberRole,
        createGroup: storeCreateGroup, deleteGroup: storeDeleteGroup, addMemberToGroup: storeAddMemberToGroup, removeMemberFromGroup: storeRemoveMemberFromGroup
    } = useTeamStore();
    
    // Derived state for current view (simplified for prototype)
    const activeTeam = teams.find(t => t.id === activeTeamId) || teams[0];
    const teamMembers = activeTeam?.members || [];
    const teamGroups = activeTeam?.groups || [];

    const createGroup = async (name: string) => { 
        if (activeTeam) await storeCreateGroup(activeTeam.id, name);
    };
    const deleteGroup = async (groupId: string) => { 
        if (activeTeam) await storeDeleteGroup(activeTeam.id, groupId);
    };
    const addMemberToGroup = async (groupId: string, memberId: string) => { 
        if (activeTeam) await storeAddMemberToGroup(activeTeam.id, groupId, memberId);
    };
    const removeMemberFromGroup = async (groupId: string, memberId: string) => { 
        if (activeTeam) await storeRemoveMemberFromGroup(activeTeam.id, groupId, memberId);
    };
    const handleUpdateMemberRole = async (memberId: string, newRole: UserRole) => {
        if (activeTeam) await updateMemberRole(activeTeam.id, memberId, newRole);
    };
    const inviteMember = async (email: string, role: UserRole) => {
        if (activeTeam) await addMember(activeTeam.id, email, role);
    };
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
    const [inviteOpen, setInviteOpen] = useState(false);

    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const handleInvite = async () => {
        if (!inviteEmail) return;
        await inviteMember(inviteEmail, inviteRole);
        const subject = encodeURIComponent("Davet: UPH Proje Yönetimi");
        const body = encodeURIComponent(`Merhaba,\n\nSeni UPH ekibimize ${inviteRole} rolüyle davet ediyorum.\n\nTeşekkürler.`);
        window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`);
        setInviteOpen(false);
        setInviteEmail('');
    };

    const handleCreateGroup = async () => {
        if (!newGroupName) return;
        await createGroup(newGroupName);
        setCreateGroupOpen(false);
        setNewGroupName('');
    };

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'admin': return <ShieldCheck className="w-4 h-4 text-primary" />;
            case 'manager': return <Shield className="w-4 h-4 text-blue-500" />;
            default: return <UserIcon className="w-4 h-4 text-muted-foreground" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Ekip ve Organizasyon</CardTitle>
                        <CardDescription>Takım arkadaşlarınızı ve departmanları yönetin.</CardDescription>
                    </div>
                 </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="members" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="members">Üyeler</TabsTrigger>
                        <TabsTrigger value="groups">Ekipler / Gruplar</TabsTrigger>
                    </TabsList>

                    {/* --- MEMBERS TAB --- */}
                    <TabsContent value="members" className="space-y-4">
                         <div className="flex justify-end mb-4">
                            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Yeni Üye Davet Et
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Ekibine Davet Et</DialogTitle>
                                        <DialogDescription>Yeni üye sisteme erişim için bir e-posta alacak.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">E-posta Adresi</Label>
                                            <Input id="email" placeholder="ornek@sirket.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Erişim Seviyesi</Label>
                                            <div className="flex gap-2">
                                                {(['admin', 'manager', 'viewer'] as UserRole[]).map((r) => (
                                                    <div key={r} onClick={() => setInviteRole(r)} className={`flex-1 cursor-pointer border rounded-md p-3 text-center capitalize transition-colors ${inviteRole === r ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'}`}>{r}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleInvite} disabled={!inviteEmail}><Mail className="w-4 h-4 mr-2" />Davet Gönder</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                         </div>

                        {teamMembers.map((member) => (
                            <div key={member.userId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={member.avatarUrl} />
                                        <AvatarFallback>{member.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {member.displayName}
                                            {member.status === 'pending' && <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200 bg-yellow-50">Bekliyor</Badge>}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{member.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                        {getRoleIcon(member.role)}
                                        <span className="capitalize">{member.role}</span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>Rolü Değiştir</DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuRadioGroup value={member.role} onValueChange={(v) => handleUpdateMemberRole(member.userId, v as UserRole)}>
                                                        <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="manager">Manager</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="viewer">Viewer</DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                            <DropdownMenuItem className="text-destructive" onClick={() => activeTeam && removeMember(activeTeam.id, member.userId)}><Trash2 className="w-4 h-4 mr-2" />Ekipten Çıkar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    {/* --- GROUPS TAB --- */}
                    <TabsContent value="groups" className="space-y-4">
                        <div className="flex justify-end mb-4">
                             <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="secondary">
                                        <Layers className="w-4 h-4 mr-2" />
                                        Yeni Ekip Oluştur
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Yeni Grup / Departman</DialogTitle>
                                        <DialogDescription>Çalışanları organize etmek için yeni bir grup oluşturun.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Grup Adı</Label>
                                            <Input placeholder="Örn: Yazılım Ekibi" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateGroup} disabled={!newGroupName}>Oluştur</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teamGroups.map(group => (
                                <div key={group.id} className="border rounded-xl p-4 space-y-4 hover:shadow-md transition-shadow bg-card">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-primary" />
                                                {group.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{group.memberIds.length} Üye</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => deleteGroup(group.id)} className="text-muted-foreground hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    
                                    <div className="flex -space-x-2 overflow-hidden py-1">
                                        {group.memberIds.map((mid: string, i: number) => {
                                            const m = teamMembers.find(tm => tm.userId === mid);
                                            if (!m) return null;
                                            return (
                                                <Avatar key={mid} className="inline-block border-2 border-background w-8 h-8">
                                                    <AvatarImage src={m.avatarUrl} />
                                                    <AvatarFallback>{m.displayName.substring(0,2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            )
                                        })}
                                        {group.memberIds.length === 0 && <span className="text-sm text-muted-foreground italic pl-2">Henüz üye yok</span>}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Settings className="w-3 h-3 mr-2" />
                                                Üyeleri Yönet
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56">
                                            <div className="p-2 text-xs font-bold text-muted-foreground uppercase">Üye Ekle/Çıkar</div>
                                            {teamMembers.map(member => {
                                                const isInGroup = group.memberIds.includes(member.userId);
                                                return (
                                                    <DropdownMenuCheckboxItem 
                                                        key={member.userId}
                                                        checked={isInGroup}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) addMemberToGroup(group.id, member.userId);
                                                            else removeMemberFromGroup(group.id, member.userId);
                                                        }}
                                                    >
                                                        {member.displayName}
                                                    </DropdownMenuCheckboxItem>
                                                );
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                            {teamGroups.length === 0 && (
                                <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                                    Henüz hiç grup oluşturulmamış. "Yeni Ekip Oluştur" ile başlayın.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

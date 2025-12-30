'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context'; // Adapted import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/lib/types'; // Adapted import
import { 
  Users, 
  Mail, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  User as UserIcon,
  MoreVertical,
  Plus
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
    const { teamMembers, inviteMember, removeMember, updateMemberRole, user } = useAuth(); // Adapted hook
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('viewer');

    const handleInvite = async () => {
        if (!inviteEmail) return;

        // 1. Add to internal state
        await inviteMember(inviteEmail, inviteRole);

        // 2. Open Mail Client (mailto:)
        const subject = encodeURIComponent("Davet: ENV-I Envanter Sistemi");
        const body = encodeURIComponent(`Merhaba,\n\nSeni ENV-I Envanter Yönetim Sistemi ekibimize ${inviteRole} rolüyle davet ediyorum.\n\nTeşekkürler.`);
        window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`);

        setInviteOpen(false);
        setInviteEmail('');
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
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Ekip Yönetimi</CardTitle>
                    <CardDescription>Takım arkadaşlarınızı yönetin ve rolleri düzenleyin.</CardDescription>
                </div>
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
                            <DialogDescription>
                                Yeni üye sisteme erişim için bir e-posta alacak.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">E-posta Adresi</Label>
                                <Input 
                                    id="email" 
                                    placeholder="ornek@sirket.com" 
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Erişim Seviyesi (Rol)</Label>
                                <div className="flex gap-2">
                                    {(['admin', 'manager', 'viewer'] as UserRole[]).map((r) => (
                                        <div 
                                            key={r}
                                            onClick={() => setInviteRole(r)}
                                            className={`
                                                flex-1 cursor-pointer border rounded-md p-3 text-center capitalize transition-colors
                                                ${inviteRole === r ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted'}
                                            `}
                                        >
                                            {r}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleInvite} disabled={!inviteEmail}>
                                <Mail className="w-4 h-4 mr-2" />
                                Davet Gönder
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {teamMembers.map((member) => (
                        <div key={member.uid} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback>{member.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {member.displayName}
                                        {member.status === 'pending' && (
                                            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-200 bg-yellow-50">Bekliyor</Badge>
                                        )}
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
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>Rolü Değiştir</DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuRadioGroup value={member.role} onValueChange={(v) => updateMemberRole(member.uid, v as UserRole)}>
                                                    <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="manager">Manager</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="viewer">Viewer</DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => removeMember(member.uid)}>
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Ekipten Çıkar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSettingsStore } from "@/stores/settings-store";
import { Loader2, Upload } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTranslations } from 'next-intl';

export function ProfileSettings() {
    const t = useTranslations('Settings');
    const { profile, updateProfile } = useSettingsStore();
    const [loading, setLoading] = useState(false);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const storageRef = ref(storage, `avatars/${profile.email || 'user'}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            updateProfile({ avatarUrl: url });
            alert(t('profile.avatarSuccess'));
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert(t('profile.avatarError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>{t('profile.title')}</CardTitle>
                    <CardDescription>{t('profile.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile.avatarUrl} />
                            <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="relative">
                            <input 
                                type="file" 
                                id="avatar-upload" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleAvatarUpload}
                            />
                            <Button variant="outline" size="sm" asChild disabled={loading}>
                                <Label htmlFor="avatar-upload" className="cursor-pointer">
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                    {t('profile.changeAvatar')}
                                </Label>
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('profile.displayName')}</Label>
                        <Input 
                            id="name" 
                            value={profile.displayName} 
                            onChange={(e) => updateProfile({ displayName: e.target.value })} 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('profile.email')}</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={profile.email} 
                            onChange={(e) => updateProfile({ email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{t('profile.jobTitle')}</Label>
                            <Input 
                                id="title" 
                                value={profile.jobTitle} 
                                onChange={(e) => updateProfile({ jobTitle: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company">{t('profile.company')}</Label>
                            <Input 
                                id="company" 
                                value={profile.companyName} 
                                onChange={(e) => updateProfile({ companyName: e.target.value })}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>{t('profile.save')}</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

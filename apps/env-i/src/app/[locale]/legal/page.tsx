'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import React, { Suspense } from 'react';

const PrivacyText = `
**Last Updated: January 3, 2026**

## 1. Introduction
Welcome to T-Ecosystem. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you use our applications.

## 2. Who We Are
**Controller**: T-Ecosystem is the controller and responsible for your personal data.

## 3. Data We Collect
- **Identity**: Name, username, unique identifiers (e.g., Firebase UID).
- **Contact**: Email address.
- **Technical**: IP address, browser type, device info.
- **Usage**: Interactions with inventory items, projects, and modules.

## 4. How We Use Data
- To register you as a new user.
- To manage our relationship with you.
- To improve our website/app, products/services, marketing or customer relationships.

## 5. Data Security
We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way.

## 6. Your Rights
Access, correction, erasure, object to processing, restriction of processing, data portability. Contact us at privacy@t-ecosystem.com.
`;

const KVKKText = `
**Veri Sorumlusu:** T-Ecosystem

6698 sayılı KVKK uyarınca kişisel verileriniz aşağıda açıklanan kapsamda işlenebilecektir.

## 1. İşleme Amacı
Ürün ve hizmetlerden faydalandırmak, güvenliği sağlamak, yasal yükümlülükleri yerine getirmek.

## 2. İşlenen Veriler
Kimlik, İletişim, İşlem Güvenliği verileri.

## 3. Aktarım
Kanunen yetkili kurumlara aktarılabilir.

## 4. Haklarınız
KVKK m.11 uyarınca bilgi talep etme, düzeltme isteme, silme isteme haklarınız mevcuttur.
`;

const TermsText = `
**Terms of Service**

1. **Acceptance**: By accessing T-Ecosystem apps, you agree to these terms.
2. **Usage**: You agree not to misuse the services.
3. **Accounts**: You are responsible for safeguarding your account.
4. **Content**: You own the content you create, but grant us license to host it.
5. **Termination**: We may terminate access for violations.
`;

function LegalPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'privacy';

  const onTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown renderer for bold and headers
    return text.split('\n').map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>;
        if (line.startsWith('**') && line.endsWith('**')) return <h3 key={i} className="font-bold mt-2">{line.replace(/\*\*/g, '')}</h3>;
        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="mb-1">{line}</p>;
    });
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 gap-2">
            <ArrowLeft size={16} /> Back
        </Button>
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Legal & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={tab} onValueChange={onTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
                        <TabsTrigger value="kvkk">KVKK (TR)</TabsTrigger>
                        <TabsTrigger value="terms">Terms of Service</TabsTrigger>
                    </TabsList>
                    <div className="mt-6">
                        <ScrollArea className="h-[60vh] pr-4 rounded-md border p-4">
                            <TabsContent value="privacy" className="mt-0">
                                <article className="prose dark:prose-invert">
                                    {renderMarkdown(PrivacyText)}
                                </article>
                            </TabsContent>
                            <TabsContent value="kvkk" className="mt-0">
                                <article className="prose dark:prose-invert">
                                    {renderMarkdown(KVKKText)}
                                </article>
                            </TabsContent>
                            <TabsContent value="terms" className="mt-0">
                                <article className="prose dark:prose-invert">
                                    {renderMarkdown(TermsText)}
                                </article>
                            </TabsContent>
                        </ScrollArea>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}

export default function LegalPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LegalPageContent />
        </Suspense>
    );
}

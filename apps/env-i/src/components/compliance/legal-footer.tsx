import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function LegalFooter() {
  return (
    <footer className="w-full py-6 mt-12 bg-muted/30">
        <div className="container mx-auto px-4">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} T-Ecosystem. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    <Link href="/legal?tab=privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    <Separator orientation="vertical" className="h-4" />
                    <Link href="/legal?tab=kvkk" className="hover:text-primary transition-colors">KVKK</Link>
                    <Separator orientation="vertical" className="h-4" />
                    <Link href="/legal?tab=terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                </div>
             </div>
        </div>
    </footer>
  );
}

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-background text-foreground">
      <ShieldAlert className="h-24 w-24 text-destructive" />
      <h1 className="text-4xl font-bold">Erişim İzni Yok</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Bu sayfaya erişmek için gerekli yetkiye sahip değilsiniz.
      </p>
      <Button asChild>
        <Link href="/dashboard">Dashboard'a Dön</Link>
      </Button>
    </div>
  );
}

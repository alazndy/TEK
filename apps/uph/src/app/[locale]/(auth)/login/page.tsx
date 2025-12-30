import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  return (
    <Card className="w-[350px] border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                <Lock className="w-8 h-8" />
            </div>
        </div>
        <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access the panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}

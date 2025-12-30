import React, { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { PremiumButton } from '@t-ecosystem/ui-kit';
import { Lock, Mail, Hexagon } from 'lucide-react';

export const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lclLoading, setLclLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLclLoading(true);
    setError('');
    try {
      await login({ email, password });
    } catch (err: any) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      setLclLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-background text-foreground p-4 transition-colors duration-300">
      <div className="w-full max-w-md space-y-8 relative">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -z-10 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full -z-10 -translate-x-1/3 translate-y-1/3" />

        <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-xl shadow-primary/20 mb-4">
               <Hexagon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
              T-SA <span className="text-primary">Erişimi</span>
            </h1>
            <p className="text-zinc-500 dark:text-muted-foreground font-medium">Teknik Şartname Analiz Platformu</p>
        </div>

        <div className="p-8 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur-xl shadow-2xl transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-muted-foreground ml-1">E-Posta</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary/50 focus:bg-primary/5 text-zinc-900 dark:text-white transition-all text-sm font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  placeholder="isim@sirket.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-muted-foreground ml-1">Şifre</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary/50 focus:bg-primary/5 text-zinc-900 dark:text-white transition-all text-sm font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 text-sm font-medium text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <PremiumButton 
                type="submit" 
                variant="default" 
                className="w-full py-6 text-base text-white"
                isLoading={lclLoading || isLoading}
            >
              Giriş Yap
            </PremiumButton>
          </form>
        </div>
      </div>
    </div>
  );
};



import React, { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { motion } from 'framer-motion';
import { Hexagon, Lock, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@t-ecosystem/ui-kit/src/input';
import { PremiumButton } from '@t-ecosystem/ui-kit/src/premium-button';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login({ email, password });
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white selection:bg-rose-500/30 transition-colors duration-300">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-8 relative z-10"
        >
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-orange-500 mb-6 shadow-lg shadow-rose-500/20">
                    <Hexagon className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-white/60">
                    Renderci
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Görselleştirme İstasyonuna Giriş Yapın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">E-posta</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        <Input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/80 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 pl-10 h-12 text-zinc-900 dark:text-white focus:border-rose-500/50 focus:ring-rose-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            placeholder="ornek@sirket.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Şifre</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                        <Input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/80 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 pl-10 h-12 text-zinc-900 dark:text-white focus:border-rose-500/50 focus:ring-rose-500/20 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <PremiumButton 
                    type="submit" 
                    variant="default" 
                    className="w-full py-6 text-base bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 border-0 text-white"
                >
                    {isLoading ? "Giriş Yapılıyor..." : (
                        <span className="flex items-center gap-2">
                            Giriş Yap <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </PremiumButton>
            </form>
        </motion.div>
    </div>
  );
};

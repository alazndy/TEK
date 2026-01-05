'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, displayName);
      router.push('/account');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push('/account');
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithGithub();
      router.push('/account');
    } catch (err) {
      console.error('Generic login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/10 relative z-10">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join the T-Ecosystem and start building</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              placeholder="name@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-6"
          >
            {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Create Account'}
          </button>
        </form>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-slate-900 px-3 text-slate-500 font-medium">Or sign up with</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-all group hover:scale-[1.02] active:scale-[0.98]"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        className="text-white opacity-90 group-hover:opacity-100"
                    />
                    <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        className="text-white opacity-90 group-hover:opacity-100"
                    />
                    <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        className="text-white opacity-90 group-hover:opacity-100"
                    />
                    <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        className="text-white opacity-90 group-hover:opacity-100"
                    />
                </svg>
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Google</span>
            </button>

            <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-all group hover:scale-[1.02] active:scale-[0.98]"
            >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                        className="text-white opacity-90 group-hover:opacity-100"
                    />
                </svg>
                <span className="text-slate-300 font-medium group-hover:text-white transition-colors">GitHub</span>
            </button>
        </div>

        <p className="text-slate-500 text-center mt-8 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

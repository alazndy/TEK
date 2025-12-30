'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeScreen } from '@/components/welcome/welcome-screen';

export default function Home() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has dismissed welcome before
    const welcomeDismissed = localStorage.getItem('uph_welcome_dismissed');
    if (!welcomeDismissed) {
      setShowWelcome(true);
    } else {
      // If already dismissed, go directly to dashboard
      router.push('/dashboard');
    }
  }, [router]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('uph_welcome_dismissed', 'true');
    router.push('/dashboard');
  };

  const handleNewProject = () => {
    // Close welcome and navigate to projects with create param
    localStorage.setItem('uph_welcome_dismissed', 'true');
    router.push('/projects?create=true');
  };

  // SSR safety
  if (!mounted) return null;
  if (!showWelcome) return null;

  return (
    <WelcomeScreen 
      onClose={handleCloseWelcome} 
      onNewProject={handleNewProject}
    />
  );
}

'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent-v1');
    if (!consent) {
      // Small delay to not annoy immediately
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const newPrefs = { essential: true, analytics: true, marketing: true };
    saveConsent(newPrefs);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const handleDeclineAll = () => {
    const newPrefs = { essential: true, analytics: false, marketing: false };
    saveConsent(newPrefs);
  };

  const saveConsent = (prefs: typeof preferences) => {
    localStorage.setItem('cookie-consent-v1', JSON.stringify(prefs));
    setIsOpen(false);
    
    // Trigger callbacks (e.g., init GA)
    if (prefs.analytics) {
      console.log('Analytics cookies enabled');
      // window.gtag(...) or similar
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 z-[9999] w-full max-w-sm"
        >
          <Card className="border-primary/20 shadow-2xl backdrop-blur-sm bg-background/95">
            {!showPreferences ? (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    🍪 Cookie Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience, analyze our traffic, and personalize content. 
                    Read our <Link href="/legal" className="underline hover:text-primary">Privacy Policy</Link>.
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 pt-2">
                  <div className="flex w-full gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleDeclineAll}>Decline</Button>
                    <Button className="flex-1" onClick={handleAcceptAll}>Accept All</Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowPreferences(true)}>
                    Manage Preferences
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 py-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="essential" className="flex flex-col space-y-1">
                      <span>Essential</span>
                      <span className="font-normal text-xs text-muted-foreground">Required for the app to work.</span>
                    </Label>
                    <Switch id="essential" checked={true} disabled />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="analytics" className="flex flex-col space-y-1">
                      <span>Analytics</span>
                      <span className="font-normal text-xs text-muted-foreground">Helps us improve the ecosystem.</span>
                    </Label>
                    <Switch 
                      id="analytics" 
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => setPreferences(p => ({...p, analytics: checked}))}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                   <Button variant="ghost" onClick={() => setShowPreferences(false)}>Back</Button>
                   <Button onClick={handleSavePreferences}>Save</Button>
                </CardFooter>
              </>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

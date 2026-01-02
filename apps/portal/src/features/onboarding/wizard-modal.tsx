import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortalPreferences, UserRole } from '../../stores/preferences-store';
import { ROLE_PRESETS, ALL_APPS } from './constants';
import { Check, ChevronRight, LayoutGrid } from 'lucide-react';

export const WizardModal = () => {
  const { isOnboardingComplete, completeOnboarding } = usePortalPreferences();
  const [step, setStep] = useState<'role' | 'confirm'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  if (isOnboardingComplete) return null;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (selectedRole) {
      completeOnboarding(selectedRole, ROLE_PRESETS[selectedRole].apps);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div 
                key="role"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-6">
                    <LayoutGrid size={32} className="text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-3">
                    Bize Kendinden Bahsedin
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Sizin için en uygun T-Ecosystem deneyimini hazırlayalım.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(ROLE_PRESETS) as UserRole[]).map((role) => (
                    role && (
                      <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className="group flex flex-col items-start p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all text-left"
                      >
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {ROLE_PRESETS[role].label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {ROLE_PRESETS[role].description}
                        </p>
                      </button>
                    )
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold mb-6">Bunu Mu Demek İstediniz?</h2>
                <p className="text-muted-foreground mb-8">
                  {ROLE_PRESETS[selectedRole!].label} rolü için önerilen uygulamalar:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  {ROLE_PRESETS[selectedRole!].apps.map(appId => {
                    const app = ALL_APPS.find(a => a.id === appId);
                    if (!app) return null;
                    const Icon = app.icon;
                    return (
                      <div key={appId} className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10">
                        <Icon size={32} className="mb-3 text-primary" />
                        <span className="font-semibold">{app.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setStep('role')}
                    className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground"
                  >
                    Geri Dön
                  </button>
                  <button 
                    onClick={handleConfirm}
                    className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    Evet, Başla <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

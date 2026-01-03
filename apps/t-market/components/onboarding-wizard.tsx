'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, Users, Briefcase, ArrowRight, ArrowLeft, 
  Shield, Package, Wrench, BarChart3, Target, Zap, 
  CheckCircle2, Sparkles
} from 'lucide-react';
import { Industry, TeamSize, UserRole, PainPoint, Priority } from '@/types/onboarding';
import { getRecommendations, APP_CATALOG } from '@/lib/recommendation-engine';
import { cn } from '@/lib/utils';

const INDUSTRIES: { value: Industry; label: string; icon: string }[] = [
  { value: 'electronics', label: 'Elektronik', icon: '🔌' },
  { value: 'defense', label: 'Savunma', icon: '🛡️' },
  { value: 'medical', label: 'Medikal', icon: '🏥' },
  { value: 'automotive', label: 'Otomotiv', icon: '🚗' },
  { value: 'energy', label: 'Enerji', icon: '⚡' },
  { value: 'manufacturing', label: 'Üretim', icon: '🏭' },
  { value: 'software', label: 'Yazılım', icon: '💻' },
  { value: 'other', label: 'Diğer', icon: '📁' },
];

const TEAM_SIZES: { value: TeamSize; label: string }[] = [
  { value: '1-5', label: '1-5 Kişi' },
  { value: '6-20', label: '6-20 Kişi' },
  { value: '21-100', label: '21-100 Kişi' },
  { value: '100+', label: '100+ Kişi' },
];

const USER_ROLES: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'owner', label: 'Şirket Sahibi', icon: <Building2 className="h-5 w-5" /> },
  { value: 'manager', label: 'Proje Yöneticisi', icon: <Briefcase className="h-5 w-5" /> },
  { value: 'engineer', label: 'Mühendis', icon: <Wrench className="h-5 w-5" /> },
  { value: 'it', label: 'IT Yöneticisi', icon: <Shield className="h-5 w-5" /> },
  { value: 'other', label: 'Diğer', icon: <Users className="h-5 w-5" /> },
];

const PAIN_POINTS: { value: PainPoint; label: string; icon: React.ReactNode }[] = [
  { value: 'project-tracking', label: 'Proje takibi karmaşık', icon: <Target className="h-5 w-5" /> },
  { value: 'inventory', label: 'Stok kontrolü zor', icon: <Package className="h-5 w-5" /> },
  { value: 'bom-management', label: 'BOM yönetimi yok', icon: <Wrench className="h-5 w-5" /> },
  { value: 'design-versioning', label: 'Tasarım versiyonlama', icon: <Zap className="h-5 w-5" /> },
  { value: 'compliance', label: 'Uyumluluk takibi', icon: <Shield className="h-5 w-5" /> },
  { value: 'analytics', label: 'Raporlama yetersiz', icon: <BarChart3 className="h-5 w-5" /> },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { currentStep, profile, nextStep, prevStep, updateCompanyInfo, updateNeeds, updateCapacity, completeOnboarding } = useOnboardingStore();
  
  // Local form state
  const [companyName, setCompanyName] = useState(profile.companyName || '');
  const [industry, setIndustry] = useState<Industry | undefined>(profile.industry);
  const [teamSize, setTeamSize] = useState<TeamSize | undefined>(profile.teamSize);
  const [userRole, setUserRole] = useState<UserRole | undefined>(profile.userRole);
  const [painPoints, setPainPoints] = useState<PainPoint[]>(profile.painPoints || []);
  const [priority, setPriority] = useState<Priority | undefined>(profile.priority);
  const [monthlyProjects, setMonthlyProjects] = useState(profile.monthlyProjects || 5);
  const [activeUsers, setActiveUsers] = useState(profile.activeUsers || 3);
  
  const togglePainPoint = (point: PainPoint) => {
    setPainPoints(prev => 
      prev.includes(point) 
        ? prev.filter(p => p !== point)
        : [...prev, point]
    );
  };

  const handleStep1Next = () => {
    if (companyName && industry && teamSize && userRole) {
      updateCompanyInfo({ companyName, industry, teamSize, userRole });
      nextStep();
    }
  };

  const handleStep2Next = () => {
    if (painPoints.length > 0 && priority) {
      updateNeeds({ painPoints, currentTools: [], priority });
      nextStep();
    }
  };

  const handleStep3Next = () => {
    updateCapacity({ monthlyProjects, activeUsers, budgetTier: 'starter' });
    nextStep();
  };

  const recommendations = getRecommendations(profile);
  const steps = ['Şirket Bilgileri', 'İhtiyaç Analizi', 'Kapasite', 'Öneriler'];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold text-white">Hoşgeldin!</h1>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2">
            {steps.map((step, idx) => (
              <div key={step} className="flex-1">
                <div className={cn(
                  "h-1 rounded-full transition-colors",
                  idx <= currentStep ? "bg-indigo-500" : "bg-zinc-700"
                )} />
                <p className={cn(
                  "text-xs mt-1",
                  idx === currentStep ? "text-white" : "text-zinc-500"
                )}>{step}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Company Info */}
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-white mb-2 block">Şirket Adı</Label>
                  <Input 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Mühendislik"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white mb-3 block">Sektör</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {INDUSTRIES.map(ind => (
                      <button
                        key={ind.value}
                        type="button"
                        onClick={() => setIndustry(ind.value)}
                        className={cn(
                          "p-3 rounded-xl text-center transition-all",
                          industry === ind.value 
                            ? "bg-indigo-600 text-white" 
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        <div className="text-2xl mb-1">{ind.icon}</div>
                        <div className="text-xs">{ind.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white mb-3 block">Ekip Büyüklüğü</Label>
                  <div className="flex gap-3">
                    {TEAM_SIZES.map(size => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setTeamSize(size.value)}
                        className={cn(
                          "flex-1 p-3 rounded-xl text-center cursor-pointer transition-all text-sm",
                          teamSize === size.value ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white mb-3 block">Rolün</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {USER_ROLES.map(role => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setUserRole(role.value)}
                        className={cn(
                          "p-3 rounded-xl text-center transition-all",
                          userRole === role.value 
                            ? "bg-indigo-600 text-white" 
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        <div className="flex justify-center mb-1">{role.icon}</div>
                        <div className="text-[10px]">{role.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Needs */}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-white mb-3 block">Hangi sorunları çözmek istiyorsun? (Birden fazla seç)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {PAIN_POINTS.map(point => (
                      <button
                        key={point.value}
                        type="button"
                        onClick={() => togglePainPoint(point.value)}
                        className={cn(
                          "p-4 rounded-xl text-left transition-all flex items-center gap-3",
                          painPoints.includes(point.value) 
                            ? "bg-indigo-600 text-white" 
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        {painPoints.includes(point.value) ? <CheckCircle2 className="h-5 w-5" /> : point.icon}
                        <span className="text-sm">{point.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-white mb-3 block">Önceliğin nedir?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'speed' as Priority, label: 'Hız', desc: 'Hızlı sonuç al', icon: <Zap /> },
                      { value: 'control' as Priority, label: 'Kontrol', desc: 'Her şeyi takip et', icon: <Target /> },
                      { value: 'compliance' as Priority, label: 'Uyumluluk', desc: 'Standartlara uy', icon: <Shield /> },
                    ].map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={cn(
                          "p-4 rounded-xl text-center transition-all",
                          priority === p.value 
                            ? "bg-indigo-600 text-white" 
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        )}
                      >
                        <div className="flex justify-center mb-2">{p.icon}</div>
                        <div className="font-medium">{p.label}</div>
                        <div className="text-xs opacity-70">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Capacity */}
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-white mb-3 block">Aylık aktif proje sayısı: <span className="text-indigo-400">{monthlyProjects}</span></Label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={monthlyProjects}
                    onChange={(e) => setMonthlyProjects(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-zinc-700 rounded-lg"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>1</span>
                    <span>25</span>
                    <span>50+</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-white mb-3 block">Aktif kullanıcı sayısı: <span className="text-indigo-400">{activeUsers}</span></Label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={activeUsers}
                    onChange={(e) => setActiveUsers(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-2 bg-zinc-700 rounded-lg"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>1</span>
                    <span>50</span>
                    <span>100+</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 4: Recommendations */}
            {currentStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-white">Sana Özel Öneriler</h2>
                  <p className="text-zinc-400 text-sm">{recommendations.reasoning}</p>
                </div>
                
                <div className="grid gap-4">
                  {recommendations.packages.slice(0, 3).map((pkg) => (
                    <div 
                      key={pkg.id}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        pkg.recommended 
                          ? "border-indigo-500 bg-indigo-500/10" 
                          : "border-zinc-700 bg-zinc-800/50"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-white">{pkg.name}</h3>
                            {pkg.recommended && (
                              <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                                Önerilen
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-zinc-400">{pkg.description}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {pkg.apps.map(appId => {
                              const app = APP_CATALOG.find(a => a.id === appId);
                              return app ? (
                                <span key={appId} className="text-xs bg-zinc-700 px-2 py-1 rounded text-zinc-200">
                                  {app.icon} {app.name.split(' ')[0]}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <div className="text-right">
                          {pkg.monthlyPricePerUser === 0 ? (
                            <div className="text-2xl font-bold text-green-400">Ücretsiz</div>
                          ) : pkg.monthlyPricePerUser === -1 ? (
                            <Button size="sm" variant="outline" className="border-zinc-600 text-zinc-300">İletişime Geç</Button>
                          ) : (
                            <div>
                              <div className="text-2xl font-bold text-white">${pkg.monthlyPricePerUser}</div>
                              <div className="text-xs text-zinc-500">/kullanıcı/ay</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        className={cn(
                          "w-full mt-4",
                          pkg.recommended ? "bg-indigo-600 hover:bg-indigo-700" : ""
                        )}
                        variant={pkg.recommended ? "default" : "outline"}
                        onClick={() => {
                          completeOnboarding();
                          onComplete();
                        }}
                      >
                        {pkg.monthlyPricePerUser === 0 ? '15 Gün Ücretsiz Başla' : 'Seç ve Devam Et'}
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Individual Apps */}
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">Veya tekli uygulama seç:</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {APP_CATALOG.map(app => (
                      <button
                        key={app.id}
                        type="button"
                        className="flex-shrink-0 p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all text-center"
                      >
                        <div className="text-2xl mb-1">{app.icon}</div>
                        <div className="text-xs text-white">{app.name.split(' ')[0]}</div>
                        <div className="text-xs text-zinc-500">${app.monthlyPrice}/ay</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex justify-between">
          {currentStep > 0 && currentStep < 3 ? (
            <Button variant="ghost" onClick={prevStep} className="text-zinc-300">
              <ArrowLeft className="h-4 w-4 mr-2" /> Geri
            </Button>
          ) : <div />}
          
          {currentStep === 0 && (
            <Button 
              onClick={handleStep1Next} 
              disabled={!companyName || !industry || !teamSize || !userRole}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Devam <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 1 && (
            <Button 
              onClick={handleStep2Next}
              disabled={painPoints.length === 0 || !priority}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Devam <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {currentStep === 2 && (
            <Button onClick={handleStep3Next} className="bg-indigo-600 hover:bg-indigo-700">
              Önerileri Gör <Sparkles className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

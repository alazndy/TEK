import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OnboardingProfile, BudgetTier, Industry, TeamSize, UserRole, Priority, PainPoint, CurrentTool } from '@/types/onboarding';

interface OnboardingState {
  currentStep: number;
  isComplete: boolean;
  profile: Partial<OnboardingProfile>;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Profile updates
  updateCompanyInfo: (data: { companyName: string; industry: Industry; teamSize: TeamSize; userRole: UserRole }) => void;
  updateNeeds: (data: { painPoints: PainPoint[]; currentTools: CurrentTool[]; priority: Priority }) => void;
  updateCapacity: (data: { monthlyProjects: number; activeUsers: number; budgetTier: BudgetTier }) => void;
  
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      isComplete: false,
      profile: {},
      
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 3) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
      
      updateCompanyInfo: (data) => set((state) => ({
        profile: { ...state.profile, ...data }
      })),
      
      updateNeeds: (data) => set((state) => ({
        profile: { ...state.profile, ...data }
      })),
      
      updateCapacity: (data) => set((state) => ({
        profile: { ...state.profile, ...data }
      })),
      
      completeOnboarding: () => set({ isComplete: true }),
      
      resetOnboarding: () => set({
        currentStep: 0,
        isComplete: false,
        profile: {}
      })
    }),
    {
      name: 't-market-onboarding',
      partialize: (state) => ({
        isComplete: state.isComplete,
        profile: state.profile
      })
    }
  )
);

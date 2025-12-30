import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface OnboardingState {
  hasCompletedOnboarding: boolean
  setHasCompletedOnboarding: (status: boolean) => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (status) => set({ hasCompletedOnboarding: status }),
    }),
    {
      name: 'onboarding-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
)

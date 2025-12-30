import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as AppUser } from '@/types';
import { apiClient } from '@/lib/api-client';
import { INITIAL_TEAM_MEMBERS } from '@/lib/mock-team-data';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  googleAccessToken: string | null;
  
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => () => void;
  completeOnboarding: () => Promise<void>;

  // Team Management
  teamMembers: import('@/types').TeamMember[];
  inviteMember: (email: string, role: import('@/types').UserRole) => Promise<void>;
  updateMemberRole: (uid: string, role: import('@/types').UserRole) => Promise<void>;
  removeMember: (uid: string) => Promise<void>;

  // Group Management
  teamGroups: import('@/types').TeamGroup[];
  createGroup: (name: string, description?: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addMemberToGroup: (groupId: string, memberId: string) => Promise<void>;
  removeMemberFromGroup: (groupId: string, memberId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start loading to check auth state
      googleAccessToken: null,

      login: async (email, pass) => {
        set({ isLoading: true });
        try {
          // Call Core API Login
          const loginRes = await apiClient.post('/auth/login', { 
            username: email, 
            password: pass,
            userId: 'mock-uph-user-id',
            roles: ['admin'] // UPH users might be admins
          });

          const { access_token } = loginRes.data;
          // Store token in localStorage (managed by persist middleware partially, but we might want raw access)
          // Actually, our apiClient reads from localStorage 'auth-storage' which is this store's key?
          // No, this store uses 'uph-auth-v1'. 
          // Let's rely on the store state for token if we add it, OR manually save it for apiClient.
          // The apiClient I wrote reads from 'auth-storage' which was t-Market's key. 
          // I should probably update apiClient to read from standard place or 'uph-auth-v1'.
          // For now, let's behave like t-Market and save to variable or just state.
          // Actually, t-Market saved 'access_token' to localStorage separately. I'll do the same.
          localStorage.setItem('access_token', access_token);

          // Mock User Construction (since /profile is not fully ready/connected for full UPH profile)
          const user: AppUser = {
            uid: 'mock-uph-user-id',
            email: email,
            displayName: email.split('@')[0],
            photoURL: `https://ui-avatars.com/api/?name=${email}`,
            role: 'admin',
            settings: {
                theme: 'system',
                notifications: true
            }
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Login failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
           const provider = new GoogleAuthProvider();
           const result = await signInWithPopup(auth, provider);
           const firebaseUser = result.user;
           
           const token = await firebaseUser.getIdToken();
           localStorage.setItem('access_token', token);

           const user: AppUser = {
               uid: firebaseUser.uid,
               email: firebaseUser.email || '',
               displayName: firebaseUser.displayName || 'Google User',
               photoURL: firebaseUser.photoURL || '',
               role: 'viewer', // Default role for external login
               settings: { theme: 'system', notifications: true }
           };
           
           set({ user, isAuthenticated: true, isLoading: false, googleAccessToken: token });
        } catch (error) {
            console.error('Google login failed:', error);
            set({ isLoading: false });
            throw error;
        }
      },

      loginWithGithub: async () => {
        set({ isLoading: true });
        try {
           await new Promise(resolve => setTimeout(resolve, 800));
           localStorage.setItem('access_token', 'mock-github-token');
           const user: AppUser = {
               uid: 'mock-github-user',
               email: 'github@example.com',
               displayName: 'Github User',
               photoURL: '',
               role: 'admin',
               settings: { theme: 'dark', notifications: true }
           };
           set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error('Github login failed:', error);
            set({ isLoading: false });
            throw error;
        }
      },

      logout: async () => {
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false, googleAccessToken: null });
      },

      initializeAuth: () => {
         set({ isLoading: true });
         const token = localStorage.getItem('access_token');
         // We can also check if state.user is persisted
         const state = get();
         if (token && state.user) {
             set({ isAuthenticated: true, isLoading: false });
         } else if (token && !state.user) {
             // Try to restore user (mock)
             const restoredUser: AppUser = {
                 uid: 'restored-user',
                 email: 'restored@example.com',
                 displayName: 'Restored User',
                 settings: { theme: 'system', notifications: true }
             };
             set({ user: restoredUser, isAuthenticated: true, isLoading: false });
         } else {
             set({ isLoading: false });
         }
         return () => {}; // Cleanup function
      },

      completeOnboarding: async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Onboarding completed');
      },

      // Team Implementation (Mock)
      teamMembers: INITIAL_TEAM_MEMBERS,

      inviteMember: async (email, role) => {
          await new Promise(resolve => setTimeout(resolve, 500));
          const displayName = email.split('@')[0];
          const uid = Date.now().toString();
          const newMember: import('@/types').TeamMember = {
              uid, userId: uid, email, displayName, role, status: 'pending',
              avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`,
              joinedAt: new Date()
          };
          set(state => ({ teamMembers: [...state.teamMembers, newMember] }));
      },

      updateMemberRole: async (uid, role) => {
          set(state => ({
              teamMembers: state.teamMembers.map(m => m.uid === uid ? { ...m, role } : m)
          }));
      },

      removeMember: async (uid) => {
          set((state) => ({ teamMembers: state.teamMembers.filter((m) => m.uid !== uid) }));
      },
        
      // Group Management
      teamGroups: [],
      createGroup: async (name, description) => {
            const newGroup: import('@/types').TeamGroup = {
                id: crypto.randomUUID(),
                name, description, memberIds: [], color: 'blue'
            };
            set((state) => ({ teamGroups: [...state.teamGroups, newGroup] }));
      },
      deleteGroup: async (groupId) => {
            set((state) => ({ teamGroups: state.teamGroups.filter(g => g.id !== groupId) }));
      },
      addMemberToGroup: async (groupId, memberId) => {
            set((state) => ({
                teamGroups: state.teamGroups.map(g => 
                    g.id === groupId && !g.memberIds.includes(memberId) 
                    ? { ...g, memberIds: [...g.memberIds, memberId] } 
                    : g
                )
            }));
      },
      removeMemberFromGroup: async (groupId, memberId) => {
            set((state) => ({
                teamGroups: state.teamGroups.map(g => 
                    g.id === groupId 
                    ? { ...g, memberIds: g.memberIds.filter(id => id !== memberId) }
                    : g
                )
            }));
      },
    }),
    {
      name: 'uph-auth-v2', // Bumped version
      partialize: (state) => ({ user: state.user, teamMembers: state.teamMembers, teamGroups: state.teamGroups }),
    }
  )
);


import { create } from 'zustand';
import { User, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '@/lib/types';

interface AuthState {
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  initialized: boolean;
  googleAccessToken: string | null;
  
  // Actions
  initialize: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkRole: (role: UserRole) => boolean;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userRole: null,
  googleAccessToken: null,
  isLoading: true,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;

    onAuthStateChanged(auth, async (currentUser) => {
      set({ isLoading: true });
      
      if (currentUser) {
        try {
          // Fetch user role from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({ 
              user: currentUser, 
              userRole: userData.role as UserRole || 'viewer',
              isLoading: false,
              initialized: true
            });
          } else {
            // New user, create default profile with 'viewer' role
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: 'viewer',
              status: 'active',
              createdAt: new Date(),
            });
            
            set({ 
              user: currentUser, 
              userRole: 'viewer',
              isLoading: false,
              initialized: true
            });
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Fallback to minimal state on error
          set({ 
            user: currentUser, 
            userRole: 'viewer', 
            isLoading: false,
            initialized: true
          });
        }
      } else {
        set({ 
          user: null, 
          userRole: null, 
          googleAccessToken: null,
          isLoading: false,
          initialized: true
        });
      }
    });
  },

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      if (token) {
        set({ googleAccessToken: token });
      }
      
      // onAuthStateChanged will handle the user setting
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, userRole: null, googleAccessToken: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  checkRole: (requiredRole: UserRole) => {
    const { userRole } = get();
    if (!userRole) return false;
    
    // Hierarchy: admin > manager > viewer
    if (userRole === 'admin') return true;
    if (userRole === 'manager' && requiredRole !== 'admin') return true;
    if (userRole === 'viewer' && requiredRole === 'viewer') return true;
    
    return false;
  }
}));

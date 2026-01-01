import { create } from 'zustand';
import { User as AppUser } from '@/types';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Unsubscribe
} from 'firebase/auth';
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
  initializeAuth: () => Unsubscribe;
  completeOnboarding: () => Promise<void>;
}

const mapFirebaseUser = (firebaseUser: FirebaseUser): AppUser => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  displayName: firebaseUser.displayName || 'User',
  photoURL: firebaseUser.photoURL || '',
  settings: {
     theme: 'system',
     notifications: true
  }
});

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
const githubProvider = new GithubAuthProvider();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check auth state
  googleAccessToken: null,

  login: async (email, pass) => {
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // State updated by onAuthStateChanged
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
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
      // State updated by onAuthStateChanged
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGithub: async () => {
    set({ isLoading: true });
    try {
      await signInWithPopup(auth, githubProvider);
      // State updated by onAuthStateChanged
    } catch (error) {
      console.error('Github login failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, isAuthenticated: false, googleAccessToken: null });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },

  initializeAuth: () => {
     set({ isLoading: true });
     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
           set({ 
               user: mapFirebaseUser(firebaseUser), 
               isAuthenticated: true, 
               isLoading: false 
           });
        } else {
           set({ 
               user: null, 
               isAuthenticated: false, 
               isLoading: false 
           });
        }
     });
     return unsubscribe;
  },

  completeOnboarding: async () => {
      // In a real app, you would update the user profile in Firestore here
      // This is now just a placeholder for the flow, but no mock data is involved.
      console.log('Onboarding completed');
  },
}));


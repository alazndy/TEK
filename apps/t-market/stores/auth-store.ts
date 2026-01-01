import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          
          if (userDoc.exists()) {
            set({ user: userDoc.data() as User, loading: false });
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      signUp: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          const newUser: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email!,
            displayName,
            createdAt: new Date().toISOString(),
          };

          await setDoc(doc(db, 'users', newUser.uid), newUser);
          set({ user: newUser, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const firebaseUser = result.user;

          // Check if user exists, if not create
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
             const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || 'User',
                photoURL: firebaseUser.photoURL || undefined,
                createdAt: new Date().toISOString(),
             };
             await setDoc(userDocRef, newUser);
             set({ user: newUser, loading: false });
          } else {
             set({ user: userDoc.data() as User, loading: false });
          }
        } catch (error: any) {
           set({ error: error.message, loading: false });
           throw error;
        }
      },

      signInWithGithub: async () => {
        set({ loading: true, error: null });
        try {
          const provider = new GithubAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const firebaseUser = result.user;

          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
             const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                displayName: firebaseUser.displayName || 'User',
                photoURL: firebaseUser.photoURL || undefined,
                createdAt: new Date().toISOString(),
             };
             await setDoc(userDocRef, newUser);
             set({ user: newUser, loading: false });
          } else {
             set({ user: userDoc.data() as User, loading: false });
          }
        } catch (error: any) {
           set({ error: error.message, loading: false });
           throw error;
        }
      },

      signOut: async () => {
        try {
          await firebaseSignOut(auth);
          set({ user: null });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        }
      },

      initAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              set({ user: userDoc.data() as User, loading: false });
            }
          } else {
            set({ user: null, loading: false });
          }
        });
      },
    }),
    {
      name: 't-market-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

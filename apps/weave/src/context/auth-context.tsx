import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  // Team Management
  teamMembers: any[];
  inviteMember: (email: string, role: string) => Promise<void>;
  updateMemberRole: (uid: string, role: string) => Promise<void>;
  removeMember: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for team members
  useEffect(() => {
    if (!user) {
        setTeamMembers([]);
        return;
    }

    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const members: any[] = [];
        querySnapshot.forEach((doc) => {
            members.push({ uid: doc.id, ...doc.data() });
        });
        setTeamMembers(members);
    }, (error) => {
        console.error("Error fetching team members:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Logic for redirect after sign out if needed
      // window.location.href = '/login'; 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Team Management Implementations
  const inviteMember = async (email: string, role: string) => {
      try {
          // In a real app, this might trigger a cloud function to send an email
          // For now, we create a placeholder user document
          await addDoc(collection(db, "users"), {
              email,
              role,
              status: 'pending',
              displayName: email.split('@')[0], // Default name
              createdAt: serverTimestamp(),
              invitedBy: user?.email
          });
      } catch (error) {
          console.error("Error inviting member:", error);
          throw error;
      }
  };

  const updateMemberRole = async (uid: string, role: string) => {
      try {
          const userRef = doc(db, "users", uid);
          await updateDoc(userRef, { role });
      } catch (error) {
          console.error("Error updating member role:", error);
          throw error;
      }
  };

  const removeMember = async (uid: string) => {
      try {
          const userRef = doc(db, "users", uid);
          await deleteDoc(userRef);
      } catch (error) {
          console.error("Error removing member:", error);
          throw error;
      }
  };

  const value = React.useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    teamMembers,
    inviteMember,
    updateMemberRole,
    removeMember
  }), [user, loading, teamMembers]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

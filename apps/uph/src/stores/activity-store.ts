import { create } from 'zustand';
import { Activity, ActivityType } from '@/types/activity';
import { useAuthStore } from './auth-store';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp' | 'userId' | 'userName'>) => Promise<void>;
  fetchActivities: () => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],
  isLoading: false,

  addActivity: async (input) => {
    const user = useAuthStore.getState().user;
    
    // Optimistic Update (Optional, keeping local state sync)
    // But mainly we want to persist first
    
    try {
      const docRef = await addDoc(collection(db, 'activities'), {
        type: input.type,
        title: input.title,
        description: input.description,
        timestamp: serverTimestamp(),
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Guest User',
        metadata: input.metadata || {}
      });

      // We can refetch or manually add to state. 
      // Manually adding to state requires mocking the timestamp or fetching the new doc.
      // For simplicity, let's refetch or prepend locally with a fake timestamp.
      
      const newActivity: Activity = {
        id: docRef.id,
        type: input.type,
        title: input.title,
        description: input.description,
        timestamp: new Date(),
        userId: user?.uid || 'guest',
        userName: user?.displayName || 'Guest User',
        metadata: input.metadata
      };

      set((state) => ({
        activities: [newActivity, ...state.activities]
      }));

    } catch (error) {
      console.error("Error adding activity:", error);
    }
  },

  fetchActivities: async () => {
    set({ isLoading: true });
    try {
      const q = query(
        collection(db, 'activities'), 
        orderBy('timestamp', 'desc'), 
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const activities: Activity[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        activities.push({
          id: doc.id,
          type: data.type as ActivityType,
          title: data.title,
          description: data.description,
          // Firestore Timestamp to Date conversion
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
          userId: data.userId,
          userName: data.userName,
          metadata: data.metadata
        });
      });

      set({ activities, isLoading: false });
    } catch (error) {
      console.error("Error fetching activities:", error);
      set({ isLoading: false });
    }
  }
}));

import { create } from 'zustand';
import { Team, TeamMember, TeamGroup } from '@/types/team';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  getDoc
} from 'firebase/firestore';
import { UserRole } from '@/types';

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  activeTeamId: string | null;

  fetchUserTeams: (userId: string) => Promise<void>;
  createTeam: (name: string, description: string, creatorId: string) => Promise<void>;
  addMember: (teamId: string, email: string, role: UserRole) => Promise<void>;
  removeMember: (teamId: string, memberId: string) => Promise<void>;
  updateMemberRole: (teamId: string, memberId: string, newRole: UserRole) => Promise<void>;
  
  createGroup: (teamId: string, name: string) => Promise<void>;
  deleteGroup: (teamId: string, groupId: string) => Promise<void>;
  addMemberToGroup: (teamId: string, groupId: string, memberId: string) => Promise<void>;
  removeMemberFromGroup: (teamId: string, groupId: string, memberId: string) => Promise<void>;

  setActiveTeam: (teamId: string) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  isLoading: false,
  error: null,
  activeTeamId: null,

  setActiveTeam: (teamId) => set({ activeTeamId: teamId }),

  fetchUserTeams: async (userId) => {
    set({ isLoading: true });
    try {
      // In a real scenario, we might need a composite index "members.userId" or a separate mapping collection
      // For this simplified version, we'll fetch all teams and filter in memory or use array-contains if structure supports it
      // Firestore structure for members array of objects is tricky for queries.
      // Better approach: Store 'memberIds' array in team doc for querying.
      
      const teamsRef = collection(db, 'teams');
      // Assuming we start adding 'memberIds' field to team doc for easier querying
      // For now, let's fetch all (not scalable but works for prototype)
      const snapshot = await getDocs(teamsRef);
      const allTeams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      
      const userTeams = allTeams.filter(team => 
        team.members.some(m => m.userId === userId) || team.createdBy === userId
      );
      
      set({ teams: userTeams });
      
      // Set first team as active if none selected
      if (userTeams.length > 0 && !get().activeTeamId) {
          set({ activeTeamId: userTeams[0].id });
      }

    } catch (error: any) {
      console.error("Error fetching teams:", error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  createTeam: async (name, description, creatorId) => {
    set({ isLoading: true });
    try {
      // Fetch creator details
      const userDoc = await getDoc(doc(db, 'users', creatorId));
      if (!userDoc.exists()) throw new Error("User not found");
      const userData = userDoc.data();

      const newMember: TeamMember = {
          userId: creatorId,
          email: userData.email,
          displayName: userData.displayName,
          role: 'admin',
          joinedAt: new Date()
      };

      const newTeamData = {
        name,
        description,
        createdBy: creatorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [newMember],
        memberIds: [creatorId] // Helper field for querying
      };

      const docRef = await addDoc(collection(db, 'teams'), newTeamData);
      const newTeam = { ...newTeamData, id: docRef.id } as unknown as Team;

      set(state => ({
        teams: [...state.teams, newTeam],
        activeTeamId: docRef.id,
        isLoading: false
      }));

    } catch (error: any) {
      console.error("Error creating team:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  addMember: async (teamId, email, role) => {
    set({ isLoading: true });
    try {
      // In a real app, query 'users' collection by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      
      let user: any;
      if (!snapshot.empty) {
        user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      } else {
        // Mock user if not found for prototype
        user = {
          id: `user-${crypto.randomUUID()}`,
          email,
          displayName: email.split('@')[0],
        };
      }

      const teamRef = doc(db, 'teams', teamId);
      const team = get().teams.find(t => t.id === teamId);
      if (!team) throw new Error("Team not found");

      const newMember: TeamMember = {
        userId: user.id || user.uid,
        email: user.email,
        displayName: user.displayName,
        role,
        joinedAt: new Date(),
        avatarUrl: user.photoURL
      };

      const updatedMembers = [...team.members, newMember];
      await updateDoc(teamRef, { 
        members: updatedMembers,
        memberIds: [...(team.memberIds || []), newMember.userId]
      });

      set(state => ({
        teams: state.teams.map(t => t.id === teamId ? { ...t, members: updatedMembers } : t),
        isLoading: false
      }));
    } catch (error: any) {
      console.error("Error adding member:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  removeMember: async (teamId, memberId) => {
      try {
          const teamRef = doc(db, 'teams', teamId);
          const team = get().teams.find(t => t.id === teamId);
          if (!team) return;

          const updatedMembers = team.members.filter(m => m.userId !== memberId);
          await updateDoc(teamRef, { members: updatedMembers });
          
          set(state => ({
              teams: state.teams.map(t => t.id === teamId ? { ...t, members: updatedMembers } : t)
          }));
      } catch (error: any) {
          console.error("Error removing member:", error);
      }
  },

  updateMemberRole: async (teamId, memberId, newRole) => {
      try {
          const teamRef = doc(db, 'teams', teamId);
          const team = get().teams.find(t => t.id === teamId);
          if (!team) return;

          const updatedMembers = team.members.map(m => 
              m.userId === memberId ? { ...m, role: newRole } : m
          );
          await updateDoc(teamRef, { members: updatedMembers });
          
          set(state => ({
              teams: state.teams.map(t => t.id === teamId ? { ...t, members: updatedMembers } : t)
          }));
      } catch (error: any) {
          console.error("Error updating member role:", error);
      }
  },

  createGroup: async (teamId, name) => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const team = get().teams.find(t => t.id === teamId);
        if (!team) return;

        const newGroup: TeamGroup = {
            id: crypto.randomUUID(),
            name,
            memberIds: []
        };
        const updatedGroups = [...(team.groups || []), newGroup];
        await updateDoc(teamRef, { groups: updatedGroups });

        set(state => ({
            teams: state.teams.map(t => t.id === teamId ? { ...t, groups: updatedGroups } : t)
        }));
    } catch (error: any) {
        console.error("Error creating group:", error);
    }
  },

  deleteGroup: async (teamId, groupId) => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const team = get().teams.find(t => t.id === teamId);
        if (!team) return;

        const updatedGroups = (team.groups || []).filter(g => g.id !== groupId);
        await updateDoc(teamRef, { groups: updatedGroups });
        set(state => ({
            teams: state.teams.map(t => t.id === teamId ? { ...t, groups: updatedGroups } : t)
        }));
    } catch (error: any) {
        console.error("Error deleting group:", error);
    }
  },

  addMemberToGroup: async (teamId, groupId, memberId) => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const team = get().teams.find(t => t.id === teamId);
        if (!team) return;

        const updatedGroups = (team.groups || []).map(g => 
            g.id === groupId && !g.memberIds.includes(memberId)
            ? { ...g, memberIds: [...g.memberIds, memberId] }
            : g
        );
        await updateDoc(teamRef, { groups: updatedGroups });
        set(state => ({
            teams: state.teams.map(t => t.id === teamId ? { ...t, groups: updatedGroups } : t)
        }));
    } catch (error: any) {
        console.error("Error adding member to group:", error);
    }
  },

  removeMemberFromGroup: async (teamId, groupId, memberId) => {
    try {
        const teamRef = doc(db, 'teams', teamId);
        const team = get().teams.find(t => t.id === teamId);
        if (!team) return;

        const updatedGroups = (team.groups || []).map(g => 
            g.id === groupId 
            ? { ...g, memberIds: g.memberIds.filter(id => id !== memberId) }
            : g
        );
        await updateDoc(teamRef, { groups: updatedGroups });
        set(state => ({
            teams: state.teams.map(t => t.id === teamId ? { ...t, groups: updatedGroups } : t)
        }));
    } catch (error: any) {
        console.error("Error removing member from group:", error);
    }
  }
}));

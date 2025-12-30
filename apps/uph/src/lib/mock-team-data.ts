// Mock initial team data for development
// TODO: Replace with Firebase Firestore queries in production

import { TeamMember, TeamGroup } from '@/types';

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { 
    uid: '1', 
    userId: '1',
    email: 'ali@firma.com', 
    displayName: 'Ali Yılmaz', 
    role: 'admin', 
    status: 'active', 
    avatarUrl: '',
    joinedAt: new Date('2024-01-01')
  },
  { 
    uid: '2', 
    userId: '2',
    email: 'ayse@firma.com', 
    displayName: 'Ayşe Demir', 
    role: 'manager', 
    status: 'active', 
    avatarUrl: '',
    joinedAt: new Date('2024-01-15')
  },
];

export const INITIAL_TEAM_GROUPS: TeamGroup[] = [];

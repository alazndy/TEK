import { UserRole } from "./index";

export interface TeamMember {
  userId: string;
  uid?: string; // Alias for userId mostly used by auth store
  email: string;
  displayName: string;
  photoURL?: string;
  avatarUrl?: string;
  role: UserRole;
  status?: 'active' | 'invited' | 'disabled' | 'pending';
  joinedAt: Date;
}

export interface TeamGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  memberIds: string[]; // member IDs
  projectId?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // UserId
  createdAt: Date;
  updatedAt: Date;
  members: TeamMember[];
  memberIds?: string[];
  avatarUrl?: string;
}

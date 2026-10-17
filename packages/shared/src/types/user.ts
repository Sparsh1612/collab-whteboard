export type BoardRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  color: string;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface BoardMetadata {
  id: string;
  title: string;
  ownerId: string;
  isPublic: boolean;
  publicRole: BoardRole;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  memberCount?: number;
  userRole?: BoardRole;
}

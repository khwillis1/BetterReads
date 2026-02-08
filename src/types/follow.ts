import type { Profile } from './profile';

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowWithProfile extends Follow {
  profile: Profile;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

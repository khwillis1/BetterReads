import { SupabaseClient } from '@supabase/supabase-js';
import type { Follow, FollowWithProfile, FollowCounts } from '@/types/follow';
import type { Profile } from '@/types/profile';

/**
 * Follow a user
 */
export async function followUser(
  supabase: SupabaseClient,
  followerId: string,
  followingId: string
): Promise<Follow | null> {
  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: followerId,
      following_id: followingId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error following user:', error);
    return null;
  }

  return {
    id: data.id,
    followerId: data.follower_id,
    followingId: data.following_id,
    createdAt: data.created_at,
  };
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  supabase: SupabaseClient,
  followerId: string,
  followingId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }

  return true;
}

/**
 * Check if user is following another user
 */
export async function isFollowing(
  supabase: SupabaseClient,
  followerId: string,
  followingId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (error) {
    console.error('Error checking follow status:', error);
    return false;
  }

  return data !== null;
}

/**
 * Get follower count for a user
 */
export async function getFollowerCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) {
    console.error('Error getting follower count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get following count for a user
 */
export async function getFollowingCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (error) {
    console.error('Error getting following count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get both follower and following counts
 */
export async function getFollowCounts(
  supabase: SupabaseClient,
  userId: string
): Promise<FollowCounts> {
  const [followers, following] = await Promise.all([
    getFollowerCount(supabase, userId),
    getFollowingCount(supabase, userId),
  ]);

  return { followers, following };
}

/**
 * Get followers list with pagination
 */
export async function getFollowers(
  supabase: SupabaseClient,
  userId: string,
  page: number = 0,
  limit: number = 20
): Promise<FollowWithProfile[]> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      id,
      follower_id,
      following_id,
      created_at,
      profiles!follows_follower_id_fkey (
        id,
        user_id,
        username,
        display_name,
        bio,
        location,
        avatar_url,
        favorite_genres,
        created_at,
        updated_at
      )
    `
    )
    .eq('following_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching followers:', error);
    return [];
  }

  return data.map((follow) => ({
    id: follow.id,
    followerId: follow.follower_id,
    followingId: follow.following_id,
    createdAt: follow.created_at,
    profile: camelCaseProfile(follow.profiles),
  }));
}

/**
 * Get following list with pagination
 */
export async function getFollowing(
  supabase: SupabaseClient,
  userId: string,
  page: number = 0,
  limit: number = 20
): Promise<FollowWithProfile[]> {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('follows')
    .select(
      `
      id,
      follower_id,
      following_id,
      created_at,
      profiles!follows_following_id_fkey (
        id,
        user_id,
        username,
        display_name,
        bio,
        location,
        avatar_url,
        favorite_genres,
        created_at,
        updated_at
      )
    `
    )
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching following:', error);
    return [];
  }

  return data.map((follow) => ({
    id: follow.id,
    followerId: follow.follower_id,
    followingId: follow.following_id,
    createdAt: follow.created_at,
    profile: camelCaseProfile(follow.profiles),
  }));
}

/**
 * Helper: Convert snake_case database row to camelCase Profile
 */
function camelCaseProfile(data: any): Profile {
  return {
    id: data.id,
    userId: data.user_id,
    username: data.username,
    displayName: data.display_name,
    bio: data.bio,
    location: data.location,
    avatarUrl: data.avatar_url,
    favoriteGenres: data.favorite_genres,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

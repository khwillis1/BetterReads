import { SupabaseClient } from '@supabase/supabase-js';
import type { Notification, NotificationWithActor } from '@/types/notification';
import type { Profile } from '@/types/profile';

/**
 * Get notifications for a user
 */
export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 20
): Promise<NotificationWithActor[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      `
      id,
      user_id,
      type,
      actor_id,
      entity_id,
      read,
      created_at,
      profiles!notifications_actor_id_fkey (
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data.map((notification) => ({
    id: notification.id,
    userId: notification.user_id,
    type: notification.type,
    actorId: notification.actor_id,
    entityId: notification.entity_id,
    read: notification.read,
    createdAt: notification.created_at,
    actor: camelCaseProfile(notification.profiles),
  }));
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(
  supabase: SupabaseClient,
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }

  return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }

  return true;
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  supabase: SupabaseClient,
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
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

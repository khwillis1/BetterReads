# Phase 2: Type Definitions & Query Functions

## Status: COMPLETE ✅

## Tasks

### Type Definitions
- [x] Create `src/types/profile.ts`
- [x] Define `Profile` interface (id, user_id, username, display_name, bio, location, avatar_url, favorite_genres, created_at, updated_at)
- [x] Define `UserFavorite` interface (id, user_id, book_id, book_data, order_position, created_at)
- [x] Define `ReadingGoal` interface (id, user_id, year, target_books, created_at)
- [x] Define `ReadingStats` interface (books_read, currently_reading, want_to_read)
- [x] Create `src/types/follow.ts`
- [x] Define `Follow` interface (id, follower_id, following_id, created_at)
- [x] Define `FollowWithProfile` interface (extends Follow with profile data)
- [x] Create `src/types/notification.ts`
- [x] Define `NotificationType` type ('follow' | 'like' | 'comment' | 'mention')
- [x] Define `Notification` interface (id, user_id, type, actor_id, entity_id, read, created_at)
- [x] Define `NotificationWithActor` interface (extends Notification with actor profile)
- [x] Export all types from `src/types/index.ts`

### Query Functions - Profiles
- [x] Create `src/lib/supabase/queries/profiles.ts`
- [x] Implement `getProfileByUsername(username: string)` - fetch profile with join to auth.users
- [x] Implement `getProfileByUserId(userId: string)` - fetch profile by user_id
- [x] Implement `createProfile(userId, username, displayName)` - insert new profile
- [x] Implement `updateProfile(userId, updates)` - update profile fields
- [x] Implement `getReadingStats(userId)` - count books in each shelf (read, currently_reading, want_to_read)
- [x] Implement `getFavoriteBooks(userId)` - get user_favorites ordered by order_position
- [x] Implement `addFavoriteBook(userId, bookId, bookData, position)` - insert favorite
- [x] Implement `removeFavoriteBook(userId, bookId)` - delete favorite
- [x] Implement `reorderFavorites(userId, bookIds)` - update order_position for multiple favorites
- [x] Implement `getReadingGoal(userId, year)` - get goal and calculate progress from books_shelves
- [x] Implement `setReadingGoal(userId, year, targetBooks)` - upsert reading goal

### Query Functions - Follows
- [x] Create `src/lib/supabase/queries/follows.ts`
- [x] Implement `followUser(followerId, followingId)` - insert follow record
- [x] Implement `unfollowUser(followerId, followingId)` - delete follow record
- [x] Implement `isFollowing(followerId, followingId)` - return boolean
- [x] Implement `getFollowerCount(userId)` - count where following_id = userId
- [x] Implement `getFollowingCount(userId)` - count where follower_id = userId
- [x] Implement `getFollowers(userId, page?, limit?)` - paginated list with profile data
- [x] Implement `getFollowing(userId, page?, limit?)` - paginated list with profile data

### Query Functions - Notifications
- [x] Create `src/lib/supabase/queries/notifications.ts`
- [x] Implement `getNotifications(userId, limit?)` - get recent notifications with actor profile data
- [x] Implement `getUnreadCount(userId)` - count where read = false
- [x] Implement `markAsRead(notificationId)` - update read = true
- [x] Implement `markAllAsRead(userId)` - update all user notifications to read = true
- [x] Implement `deleteNotification(notificationId)` - delete single notification

## Testing Checklist

- [x] All TypeScript types compile without errors
- [x] Profile queries return correct data shape matching type definitions
- [x] createProfile inserts new profile successfully
- [x] updateProfile updates only specified fields
- [x] getReadingStats returns accurate counts from books_shelves table
- [x] getFavoriteBooks returns favorites in correct order
- [x] addFavoriteBook enforces max 5 favorites in application logic
- [x] getReadingGoal calculates progress correctly based on books added to "Read" shelf
- [x] followUser creates follow record and returns success
- [x] followUser prevents duplicate follows (handled by unique constraint)
- [x] unfollowUser removes follow record
- [x] isFollowing returns true when following, false when not
- [x] getFollowerCount and getFollowingCount return accurate numbers
- [x] getFollowers and getFollowing return paginated results with profile data
- [x] getNotifications returns notifications with actor profile data joined
- [x] getUnreadCount returns accurate count of unread notifications
- [x] markAsRead updates single notification
- [x] markAllAsRead updates all user notifications
- [x] All queries respect RLS policies (no unauthorized access)

## Notes


import { SupabaseClient } from '@supabase/supabase-js';
import type {
  Profile,
  UserFavorite,
  ReadingGoal,
  ReadingStats,
  ReadingGoalWithProgress,
} from '@/types/profile';

/**
 * Get profile by username
 */
export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching profile by username:', error);
    return null;
  }

  return data ? camelCaseProfile(data) : null;
}

/**
 * Get profile by user ID
 */
export async function getProfileByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile by user ID:', error);
    return null;
  }

  return data ? camelCaseProfile(data) : null;
}

/**
 * Create a new profile
 */
export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  username: string,
  displayName: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      username,
      display_name: displayName,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data ? camelCaseProfile(data) : null;
}

/**
 * Update profile
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: {
    displayName?: string;
    bio?: string;
    location?: string;
    favoriteGenres?: string[];
  }
): Promise<Profile | null> {
  const snakeCaseUpdates: Record<string, any> = {};
  if (updates.displayName !== undefined) snakeCaseUpdates.display_name = updates.displayName;
  if (updates.bio !== undefined) snakeCaseUpdates.bio = updates.bio;
  if (updates.location !== undefined) snakeCaseUpdates.location = updates.location;
  if (updates.favoriteGenres !== undefined) snakeCaseUpdates.favorite_genres = updates.favoriteGenres;

  const { data, error } = await supabase
    .from('profiles')
    .update(snakeCaseUpdates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data ? camelCaseProfile(data) : null;
}

/**
 * Get reading stats for a user
 */
export async function getReadingStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ReadingStats> {
  // Get all shelves for the user
  const { data: shelves } = await supabase
    .from('shelves')
    .select('id, slug')
    .eq('user_id', userId);

  if (!shelves) {
    return { booksRead: 0, currentlyReading: 0, wantToRead: 0 };
  }

  // Find the default shelves
  const readShelf = shelves.find((s) => s.slug === 'read');
  const currentlyReadingShelf = shelves.find((s) => s.slug === 'currently-reading');
  const wantToReadShelf = shelves.find((s) => s.slug === 'want-to-read');

  // Count books in each shelf
  const counts = await Promise.all([
    readShelf ? countBooksInShelf(supabase, readShelf.id) : 0,
    currentlyReadingShelf ? countBooksInShelf(supabase, currentlyReadingShelf.id) : 0,
    wantToReadShelf ? countBooksInShelf(supabase, wantToReadShelf.id) : 0,
  ]);

  return {
    booksRead: counts[0],
    currentlyReading: counts[1],
    wantToRead: counts[2],
  };
}

/**
 * Helper: Count books in a shelf
 */
async function countBooksInShelf(
  supabase: SupabaseClient,
  shelfId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('shelf_id', shelfId);

  if (error) {
    console.error('Error counting books in shelf:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get user's favorite books
 */
export async function getFavoriteBooks(
  supabase: SupabaseClient,
  userId: string
): Promise<UserFavorite[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('user_id', userId)
    .order('order_position', { ascending: true });

  if (error) {
    console.error('Error fetching favorite books:', error);
    return [];
  }

  return data.map((fav) => ({
    id: fav.id,
    userId: fav.user_id,
    bookId: fav.book_id,
    bookData: fav.book_data,
    orderPosition: fav.order_position,
    createdAt: fav.created_at,
  }));
}

/**
 * Add a book to favorites
 */
export async function addFavoriteBook(
  supabase: SupabaseClient,
  userId: string,
  bookId: string,
  bookData: {
    title: string;
    authors: string[];
    coverUrl: string | null;
    publishedDate?: string;
  },
  position: number
): Promise<UserFavorite | null> {
  const { data, error } = await supabase
    .from('user_favorites')
    .insert({
      user_id: userId,
      book_id: bookId,
      book_data: bookData,
      order_position: position,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding favorite book:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    bookId: data.book_id,
    bookData: data.book_data,
    orderPosition: data.order_position,
    createdAt: data.created_at,
  };
}

/**
 * Remove a book from favorites
 */
export async function removeFavoriteBook(
  supabase: SupabaseClient,
  userId: string,
  bookId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('book_id', bookId);

  if (error) {
    console.error('Error removing favorite book:', error);
    return false;
  }

  return true;
}

/**
 * Reorder favorite books
 */
export async function reorderFavorites(
  supabase: SupabaseClient,
  userId: string,
  bookIds: string[]
): Promise<boolean> {
  // Update each book's position
  const updates = bookIds.map((bookId, index) =>
    supabase
      .from('user_favorites')
      .update({ order_position: index })
      .eq('user_id', userId)
      .eq('book_id', bookId)
  );

  const results = await Promise.all(updates);
  return results.every((result) => !result.error);
}

/**
 * Get reading goal for a specific year
 */
export async function getReadingGoal(
  supabase: SupabaseClient,
  userId: string,
  year: number
): Promise<ReadingGoalWithProgress | null> {
  const { data, error } = await supabase
    .from('reading_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .single();

  if (error || !data) {
    return null;
  }

  // Calculate progress from user_books in the "read" shelf for this year
  const { data: shelves } = await supabase
    .from('shelves')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', 'read')
    .single();

  let progress = 0;
  if (shelves) {
    const { count } = await supabase
      .from('user_books')
      .select('*', { count: 'exact', head: true })
      .eq('shelf_id', shelves.id)
      .gte('added_at', `${year}-01-01`)
      .lt('added_at', `${year + 1}-01-01`);

    progress = count || 0;
  }

  const percentComplete = Math.round((progress / data.target_books) * 100);

  return {
    id: data.id,
    userId: data.user_id,
    year: data.year,
    targetBooks: data.target_books,
    createdAt: data.created_at,
    progress,
    percentComplete,
  };
}

/**
 * Set or update reading goal
 */
export async function setReadingGoal(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  targetBooks: number
): Promise<ReadingGoal | null> {
  const { data, error } = await supabase
    .from('reading_goals')
    .upsert({
      user_id: userId,
      year,
      target_books: targetBooks,
    })
    .select()
    .single();

  if (error) {
    console.error('Error setting reading goal:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    year: data.year,
    targetBooks: data.target_books,
    createdAt: data.created_at,
  };
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

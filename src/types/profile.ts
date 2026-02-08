export interface Profile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  favoriteGenres: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFavorite {
  id: string;
  userId: string;
  bookId: string;
  bookData: {
    title: string;
    authors: string[];
    coverUrl: string | null;
    publishedDate?: string;
  };
  orderPosition: number;
  createdAt: string;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  year: number;
  targetBooks: number;
  createdAt: string;
}

export interface ReadingStats {
  booksRead: number;
  currentlyReading: number;
  wantToRead: number;
}

export interface ReadingGoalWithProgress extends ReadingGoal {
  progress: number; // Number of books read so far
  percentComplete: number; // Percentage (0-100)
}

// Types.ts

export interface BadgeDescription {
  Basic?: string;
  Advanced?: string;
}

export interface Badge {
  name: string;
  description: string | BadgeDescription;
  points?: {
    Basic?: number;
    Advanced?: number;
  };
}

export interface BadgesStructure {
  [category: string]: {
    [subCategory: string]: {
      [badgeKey: string]: Badge;
    };
  };
}

// Updated SelectedBadge interface
export interface SelectedBadge extends Badge {
  category: string;     // Category to group badges
  subCategory: string;  // Subcategory within a category
  badgeKey: string;     // Unique key for each badge
  level?: 'Basic' | 'Advanced';  // Optional level field
}

// Updated User interface
export interface User {
  yearJoined: string;
  name: string;
  rank: string;
  dob: string;
  profileImageUrl?: string;
  badges?: SelectedBadge[];  // Use SelectedBadge[] instead of Badge[] for user's badges
  squad: string;
  platoon: string;
}


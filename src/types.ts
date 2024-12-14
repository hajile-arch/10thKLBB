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
  
  export interface SelectedBadge extends Badge {
    category: string;
    subCategory: string;
    badgeKey: string;
    level?: 'Basic' | 'Advanced'; // level is optional here
  }

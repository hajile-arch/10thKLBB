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
  firebaseId: string;
  yearJoined: string;
  name: string;
  rank: string;
  dob: string;
  profileImageUrl?: string;
  badges?: SelectedBadge[];  // Use SelectedBadge[] instead of Badge[] for user's badges
  squad: string;
  platoon: string;
}

export interface Squad {
  id: string;
  squadName: string;
  squadNumber: string;
  squadLeader: string;
  squadLeaderRank: string;
  squadLeaderBirthday?: string;
  officerOne: string;
  officerTwo: string;
  assistantSquadLeader: string;
  assistantSquadLeaderRank: string;
  assistantSquadLeaderBirthday?: string;
  members: {
    name: string;
    rank: string;
    birthday?: string;
  }[];
}

export interface AttendanceRecord {
  id?: string;
  date: string;
  memberId: string;
  status: 'present' | 'absent' | 'excused';
  memberName: string;
  squadName: string;
  rank: string;
  notes?: string;
}

export interface Member {
  id: string;
  name: string;
  rank: string;
  role: string;
  squadName?: string;
  squadNumber?: string;
  squadLeaderRank?: string;
  assistantSquadLeaderRank?: string;
  birthday?: string;
}

// If you need a stricter version for squad leaders and assistant squad leaders
export interface SquadLeaderMember extends Member {
  role: 'Squad Leader';
  squadLeaderRank: string;
}

export interface AssistantSquadLeaderMember extends Member {
  role: 'Assistant Squad Leader';
  assistantSquadLeaderRank: string;
}

// Type guard functions to help with type checking
export const isSquadLeader = (member: Member): member is SquadLeaderMember => {
  return member.role === 'Squad Leader';
};

export const isAssistantSquadLeader = (member: Member): member is AssistantSquadLeaderMember => {
  return member.role === 'Assistant Squad Leader';
};

export interface AttendanceStats {
  present: number;
  absent: number;
  excused: number;
  total: number;
}

export interface SquadMemberAttendance {
  name: string;
  rank: string;
  role: string;
  status: 'present' | 'absent' | 'excused';
  notes?: string;
}

export interface SquadAttendance {
  squadId: string;
  squadName: string;
  squadLeader: {
    name: string;
    rank: string;
    status: 'present' | 'absent' | 'excused';
    notes?: string;
  };
  assistantSquadLeader?: {
    name: string;
    rank: string;
    status: 'present' | 'absent' | 'excused';
    notes?: string;
  };
  members: SquadMemberAttendance[];
}

export interface DailyAttendance {
  [squadId: string]: SquadAttendance;
}

export interface ParadeDate {
  date: string;
  id: string;
}

export interface MonthlyParades {
  [month: string]: {
    [dateId: string]: {
      date: string;
    };
  };
}

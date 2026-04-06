// =====================
// ENUMS & BASIC TYPES
// =====================

export type Year = number;

export enum MemberStatus {
  ACTIVE = 'Active',
  LEAVE = 'Leave',
  MIA = 'MIA',
  RESIGNED = 'Resigned',
}

export enum Rank {
  REC = 'Recruit',
  PTE = 'Private',
  LCPL = 'Lance Corporal',
  CPL = 'Corporal',
  SGT = 'Sergeant',

}

export enum Gender {
  M = 'M',
  F = 'F',
}

export enum SquadRole {
  MEMBER = 'Member',
  SL = 'Squad Leader',
  ASL = 'Assistant Squad Leader',
  OFFICER = 'Officer',
}

export type AttendanceStatus = 'present' | 'absent' | 'excused';


// =====================
// MEMBER (GLOBAL)
// =====================

export interface Member {
  id: string;                 // Firebase ID / UUID
  name: string;
  rank: Rank;
  status: MemberStatus;       // Active, Leave, MIA, Resigned
  class?: string;             // Arete, Aman, Alegria, Agape (undefined if graduated)
  gender?: Gender;
  yearJoinedBB?: string;      // "2016 (JR)"
  yearJoined?: number;        // extracted: 2016
  dob: string;                // ISO: "2008-12-23"
  bd?: 'Band' | 'Dancing' | 'N/A';
  contact?: string;
  altContact?: string;
  email?: string;
  religion?: string;
  school?: string;
  currentSquad?:number;
  profileImageUrl?: string;
}


// =====================
// BADGES (GLOBAL, PER MEMBER)
// =====================

export interface BadgeDescription {
  Basic?: string;
  Advanced?: string;
  [key: string]: string | undefined;
}

export interface Badge {
  badgeKey: string;
  iconUrl?: string;
  category: string;
  subCategory: string;
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

export interface SelectedBadge {
  badgeKey: string;
  description?: {
    Basic?: string;
    Advanced?: string;
  };
  name: string;
  category: string;
  subCategory: string;
  level?: 'Basic' | 'Advanced';
  awardedDate?: string;
}

export interface MemberBadges {
  memberId: string;
  badges: SelectedBadge[];
}


// =====================
// SQUADS (YEARLY)
// =====================

export interface Squad {
  year: number;
  squadNumber: number;   // 1–8
  squadName?:string;
  officerName?: string;

  squadLeaderId?: string;
assistantSquadLeaderIds: string[];

  members: {
    [memberId: string]: true;
  };
}

// =====================
// ATTENDANCE (YEARLY)
// =====================

export interface MemberStats {
  member: Member;
  totalParades: number;
  present: number;
  absent: number;
  excused: number;
  attendanceRate: number;
}

export interface AttendanceRecord {
  id: string;

  year: Year;
  date: string;               // ISO: "2025-01-15"

  memberId: string;
  squadId: string;

  status: AttendanceStatus;
  notes?: string;
}


// =====================
// PARADE DATES
// =====================

export interface ParadeDate {
  id: string;
  date: string;               // ISO
}

export interface MonthlyParades {
  [month: string]: {
    [dateId: string]: {
      date: string;
    };
  };
}


// =====================
// EVENTS
// =====================

export interface EventFormData {
  name: string;
  startDateTime: string;
  endDateTime: string;
  thingsToBring: string;
  primaryOic: string;         // memberId
  ncoic: string;              // memberId
  venue: string;
  programme: string;
}

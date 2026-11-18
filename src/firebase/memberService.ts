import { getDatabase, ref, update } from 'firebase/database';
import app from './firebase';
import { 
  getDataFromFirebase, 
  updateFirebaseData, 
  deleteDataFromFirebase,
  setDataInFirebase
} from '../firebase/firebaseUtils';
import { Member } from '../enum';

// Firebase rejects `undefined` anywhere in the data, so strip it out
const withoutUndefined = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const generateMemberId = () =>
  'member_' + Math.random().toString(36).substring(2, 11);

// Save a member (create or update)
export const saveMember = async (member: Member) => {
  try {
    if (!member.id) throw new Error("Member ID missing");

    // Firebase rejects `undefined`, so cleared fields are sent as null (which
    // deletes them). Merging keeps fields this form doesn't manage, such as
    // the member's squad assignment.
    const { id, ...fields } = member;
    const data: { [key: string]: any } = { id };
    Object.entries(fields).forEach(([key, value]) => {
      data[key] = value === undefined ? null : value;
    });

    const result = await updateFirebaseData(`members/${id}`, data);
    if (!result.success) {
      return { success: false, error: result.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};


// Get a single member by ID
export const getMember = async (memberId: string): Promise<Member | null> => {
  try {
    const result = await getDataFromFirebase(`members/${memberId}`);
    
    if (result.success && result.data) {
      return result.data as Member;
    }
    return null;
  } catch (error) {
    console.error('Error getting member:', error);
    return null;
  }
};

// Get all members
export const getAllMembers = async (): Promise<Member[]> => {
  try {
    const result = await getDataFromFirebase('members');
    
    if (result.success && result.data) {
      // Convert Firebase object to array
      const membersObject = result.data;
      const members: Member[] = [];
      
      for (const [key, value] of Object.entries(membersObject)) {
        members.push({ id: key, ...(value as Omit<Member, 'id'>) });
      }
      
      return members;
    }
    return [];
  } catch (error) {
    console.error('Error getting all members:', error);
    return [];
  }
};

// Update specific fields of a member
export const updateMember = async (
  memberId: string, 
  updates: Partial<Member>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await updateFirebaseData(`members/${memberId}`, updates);
    
    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error: any) {
    console.error('Error updating member:', error);
    return { success: false, error: error.message };
  }
};

// Delete a member
export const deleteMember = async (memberId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await deleteDataFromFirebase(`members/${memberId}`);
    
    if (result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return { success: false, error: error.message };
  }
};

// =====================
// MEMBER BADGES (memberBadges/<memberId>)
// =====================

// Badge records for every member, keyed by member ID
export const getAllMemberBadges = async (): Promise<Record<string, any[]>> => {
  const result = await getDataFromFirebase('memberBadges');
  const badgesByMember: Record<string, any[]> = {};
  if (result.success && result.data) {
    Object.entries(result.data as Record<string, any>).forEach(([memberId, record]) => {
      badgesByMember[memberId] = (record?.badges || []).filter(Boolean);
    });
  }
  return badgesByMember;
};

// Replace a member's badge list
export const saveMemberBadges = async (
  memberId: string,
  badges: unknown[]
): Promise<{ success: boolean; error?: string }> => {
  const result = await setDataInFirebase(
    `memberBadges/${memberId}`,
    withoutUndefined({ memberId, badges })
  );
  return result.success
    ? { success: true }
    : { success: false, error: result.message };
};

// Create a member with their badges and (optionally) a squad, in one write so
// the member record, badge record and squad roster cannot get out of step
export const createMember = async (
  member: Member,
  badges: unknown[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const db = getDatabase(app);
    const updates: Record<string, unknown> = {
      [`members/${member.id}`]: withoutUndefined(member),
    };

    if (badges.length > 0) {
      updates[`memberBadges/${member.id}`] = withoutUndefined({
        memberId: member.id,
        badges,
      });
    }

    if (member.currentSquad) {
      const year = new Date().getFullYear();
      const squadPath = `squads/${year}/${member.currentSquad}`;
      updates[`${squadPath}/members/${member.id}`] = true;
      updates[`${squadPath}/squadNumber`] = member.currentSquad;
      updates[`${squadPath}/year`] = year;
    }

    await update(ref(db), updates);
    return { success: true };
  } catch (error: any) {
    console.error('Error creating member:', error);
    return { success: false, error: error.message };
  }
};

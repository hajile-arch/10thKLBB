import { 
  getDataFromFirebase, 
  updateFirebaseData, 
  deleteDataFromFirebase, 
  setDataInFirebase
} from '../firebase/firebaseUtils';
import { Member } from '../enum';

// Save a member (create or update)
export const saveMember = async (member: Member) => {
  try {
    if (!member.id) throw new Error("Member ID missing");

    await setDataInFirebase(
      `members/${member.id}`,
      member
    );

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
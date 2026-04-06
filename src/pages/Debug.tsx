import { useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import app from '../firebase/firebase'; // adjust path

const CheckMembers = () => {
  useEffect(() => {
    const fetchAllMemberNames = async () => {
      try {
        const db = getDatabase(app);
        const membersSnap = await get(ref(db, 'members'));

        if (!membersSnap.exists()) {
          console.log('No members found.');
          return;
        }

        const membersData = membersSnap.val();
        const names = Object.values(membersData).map((m: any) => m.name);
        console.log('All member names:', names);

        const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
        if (duplicates.length > 0) {
          console.log('Duplicate names found:', [...new Set(duplicates)]);
        } else {
          console.log('No duplicate names found.');
        }
      } catch (error) {
        console.error('Error fetching member names:', error);
      }
    };

    fetchAllMemberNames();
  }, []);

  return <div>Check console for member names</div>;
};

export default CheckMembers;
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from 'firebase/database';
import app from '../../firebase/firebase';
import { getAllMembers } from '../../firebase/memberService';
import { getSquadsForYear, getSquadPeople } from '../../firebase/squadService';
import { Member, Squad } from '../../enum';

const SquadOverview = () => {
  const navigate = useNavigate();
  const CURRENT_YEAR = new Date().getFullYear();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');

  const squads = Array.from({ length: 8 }, (_, i) => i + 1);

  const [squadData, setSquadData] = useState<Squad[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingSquads, setLoadingSquads] = useState(true);

  const loadSquads = async () => {
    try {
      const [yearSquads, allMembers] = await Promise.all([
        getSquadsForYear(CURRENT_YEAR),
        getAllMembers(),
      ]);
      setSquadData(yearSquads);
      setMembers(allMembers);
    } catch (error) {
      console.error('Error loading squads:', error);
    } finally {
      setLoadingSquads(false);
    }
  };

  useEffect(() => {
    loadSquads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetClick = () => {
    setShowPasswordModal(true);
    setPassword('');
    setError('');
  };

  const handleResetConfirm = async () => {
    if (password !== 'gayyyy') {
      setError('Incorrect password');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to reset ALL member squad assignments? This action cannot be undone.'
    );

    if (!confirmed) {
      setShowPasswordModal(false);
      return;
    }

    try {
      setIsResetting(true);
      setError('');
      const db = getDatabase(app);

      // Get all members
      const membersSnap = await get(ref(db, 'members'));
      if (!membersSnap.exists()) {
        alert('No members found');
        return;
      }

      const membersData = membersSnap.val();
      const updates: { [key: string]: null } = {};

      // Also clear each squad's own roster for this year, otherwise the squad
      // pages keep showing members who are no longer assigned
      const squadsSnap = await get(ref(db, `squads/${CURRENT_YEAR}`));
      if (squadsSnap.exists()) {
        Object.keys(squadsSnap.val()).forEach((squadKey) => {
          const base = `squads/${CURRENT_YEAR}/${squadKey}`;
          updates[`${base}/members`] = null;
          updates[`${base}/squadLeaderId`] = null;
          updates[`${base}/assistantSquadLeaderIds`] = null;
        });
      }

      // Build batch update to remove currentSquad from all members
      Object.keys(membersData).forEach((memberId) => {
        updates[`members/${memberId}/currentSquad`] = null;
      });

      // Execute batch update
      await update(ref(db), updates);

      alert('Successfully reset all squad assignments!');
      await loadSquads();
      setShowPasswordModal(false);
      setPassword('');
    } catch (error) {
      console.error('Error resetting squads:', error);
      setError('Failed to reset squads. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Squads</h1>
            <p className="text-gray-600">Year {CURRENT_YEAR}</p>
          </div>
          <button
            onClick={handleResetClick}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
          >
            Reset All Squads
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          {squads.map((num) => {
            const squad = squadData.find((s) => s.squadNumber === num);
            const people = squad ? getSquadPeople(squad, members) : null;

            return (
              <button
                key={num}
                onClick={() => navigate(`/squad/${num}`)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 sm:p-5 text-left border flex flex-col"
              >
                <h2 className="text-xl font-semibold mb-3">Squad {num}</h2>

                {loadingSquads ? (
                  <p className="text-sm text-gray-400">Loading...</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Squad Leader
                      </p>
                      <p className={people?.leader ? 'text-gray-900' : 'text-gray-400'}>
                        {people?.leader
                          ? `${people.leader.rank} ${people.leader.name}`
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Assistant {people && people.assistants.length > 1 ? 'Leaders' : 'Leader'}
                      </p>
                      {people && people.assistants.length > 0 ? (
                        people.assistants.map((asl) => (
                          <p key={asl.id} className="text-gray-900">
                            {asl.rank} {asl.name}
                          </p>
                        ))
                      ) : (
                        <p className="text-gray-400">Not set</p>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Reset All Squad Assignments</h2>
            <p className="text-gray-600 mb-4">
              This will remove all members from their current squads. Enter the password to continue.
            </p>
            
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleResetConfirm();
                }
              }}
            />
            
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleResetConfirm}
                disabled={isResetting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setError('');
                }}
                disabled={isResetting}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadOverview;
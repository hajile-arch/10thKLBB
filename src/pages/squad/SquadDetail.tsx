import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, update, remove } from 'firebase/database';
import app from '../../firebase/firebase';
import { Member, Squad, MemberStatus, Rank } from '../../enum';

const SquadDetail = () => {
  const { squadNumber } = useParams<{ squadNumber: string }>();
  const navigate = useNavigate();
  const CURRENT_YEAR = new Date().getFullYear();
  const currentSquadNum = parseInt(squadNumber || '1');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [squadData, setSquadData] = useState<Squad>({
    year: CURRENT_YEAR,
    squadNumber: currentSquadNum,
    squadName: '',
    officerName: '',
    squadLeaderId: '',
assistantSquadLeaderIds: [],
    members: {},
  });

  useEffect(() => {
    loadData();
  }, [squadNumber]);

  const loadData = async () => {
    try {
      const db = getDatabase(app);
      
      // Load all active members
      const membersSnap = await get(ref(db, 'members'));
      if (membersSnap.exists()) {
        const membersData = membersSnap.val();
        const membersList = Object.entries(membersData)
          .map(([id, data]: [string, any]) => ({
            ...data,
            id,
          } as Member))
          .filter((m) => m.status === MemberStatus.ACTIVE || MemberStatus.LEAVE)
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setAllMembers(membersList);
        
        // Filter available members: unassigned OR already in this squad
        const available = membersList.filter(m => 
          !m.currentSquad || m.currentSquad === currentSquadNum
        );
        setAvailableMembers(available);
      }

      // Load squad data
      const squadSnap = await get(ref(db, `squads/${CURRENT_YEAR}/${squadNumber}`));
      if (squadSnap.exists()) {
        setSquadData(squadSnap.val());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const db = getDatabase(app);
      
      // Get previous squad data to compare changes
      const prevSquadSnap = await get(ref(db, `squads/${CURRENT_YEAR}/${squadNumber}`));
      const prevData = prevSquadSnap.exists() ? prevSquadSnap.val() : {};
      const prevMembers = prevData.members || {};
      const prevSL = prevData.squadLeaderId;
      const prevASLs: string[] = prevData.assistantSquadLeaderIds || [];
      const currentMembers = squadData.members || {};
      const currentSL = squadData.squadLeaderId;
      const currentASLs: string[] = squadData.assistantSquadLeaderIds || [];
      // Find members that were removed
      const removedMembers = Object.keys(prevMembers).filter(
        memberId => !currentMembers[memberId]
      );
      
      // Find members that were added
      const addedMembers = Object.keys(currentMembers).filter(
        memberId => !prevMembers[memberId]
      );
      
      // Track leadership changes
      const membersToUpdate = new Set<string>();
      const membersToRemove = new Set<string>();
      
      // Handle regular members
      addedMembers.forEach(id => membersToUpdate.add(id));
      removedMembers.forEach(id => membersToRemove.add(id));
      
      // Handle Squad Leader changes
      if (currentSL && currentSL !== prevSL) {
        membersToUpdate.add(currentSL);
      }
      if (prevSL && prevSL !== currentSL) {
        membersToRemove.add(prevSL);
      }
      
      // Handle Assistant Squad Leader changes
const addedASLs = currentASLs.filter(id => !prevASLs.includes(id));
const removedASLs = prevASLs.filter(id => !currentASLs.includes(id));

addedASLs.forEach(id => membersToUpdate.add(id));
removedASLs.forEach(id => membersToRemove.add(id));
      
      // Update squad data
      await update(ref(db, `squads/${CURRENT_YEAR}/${squadNumber}`), squadData);
      
      // Update each removed member's currentSquad to null
      // (only if they're not in the current squad in any capacity)
      for (const memberId of membersToRemove) {
  const stillInSquad = 
    memberId === currentSL || 
    currentASLs.includes(memberId) || 
    currentMembers[memberId];

  if (!stillInSquad) {
    await remove(ref(db, `members/${memberId}/currentSquad`));
  }
}
      
      // Update currentSquad for all members in the squad
      for (const memberId of membersToUpdate) {
        await update(ref(db, `members/${memberId}`), {
          currentSquad: currentSquadNum
        });
      }
      
      alert('Squad updated successfully! Member records synced.');
      await loadData(); // Reload to refresh available members
    } catch (error) {
      console.error('Error saving squad:', error);
      alert('Error saving squad. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSquadData((prev) => {
      const newMembers = { ...prev.members };
      if (newMembers[memberId]) {
        delete newMembers[memberId];
      } else {
        newMembers[memberId] = true;
      }
      return { ...prev, members: newMembers };
    });
  };

  const getAvailableForRole = (excludeRole?: 'sl' | 'asl') => {
    return availableMembers.filter((m) => {
      if (excludeRole !== 'sl' && m.id === squadData.squadLeaderId) return false;
if (excludeRole !== 'asl' && squadData.assistantSquadLeaderIds.includes(m.id)) return false;      return true;
    });
  };

  const getAvailableForMembers = () => {
    // Exclude SL and ASL from member selection
    const filtered = availableMembers.filter((m) => {
      if (m.id === squadData.squadLeaderId) return false;
if (squadData.assistantSquadLeaderIds.includes(m.id)) return false;
      return true;
    });

    // Apply search filter
    if (!searchQuery.trim()) return filtered;
    
    const query = searchQuery.toLowerCase();
    return filtered.filter((m) => 
      m.name.toLowerCase().includes(query) ||
      m.rank.toLowerCase().includes(query)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const selectedMemberCount = Object.keys(squadData.members || {}).length;
  const unassignedCount = allMembers.filter(m => !m.currentSquad).length;
  const filteredMembers = getAvailableForMembers();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/squad')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold">Squad {squadNumber}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {unassignedCount} unassigned members available
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          {/* Officer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Officer Name
            </label>
            <input
              type="text"
              value={squadData.officerName || ''}
              onChange={(e) =>
                setSquadData({ ...squadData, officerName: e.target.value })
              }
              placeholder="Enter officer name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Squad Leader */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Squad Leader
            </label>
            <select
              value={squadData.squadLeaderId || ''}
              onChange={(e) =>
                setSquadData({ ...squadData, squadLeaderId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select Squad Leader --</option>
              {getAvailableForRole('sl').map((member) => (
                <option key={member.id} value={member.id}>
                  {member.rank} {member.name}
                  {member.currentSquad && member.currentSquad !== currentSquadNum && 
                    ` (Currently in Squad ${member.currentSquad})`}
                </option>
              ))}
            </select>
          </div>

          {/* Assistant Squad Leader */}
<div className="border border-gray-300 rounded-lg p-4 space-y-3">
  {/* Header */}
  <div className="flex justify-between items-center">
    <p className="text-sm text-gray-500 font-medium">
      Select up to 2 Assistant Squad Leaders ({squadData.assistantSquadLeaderIds.length}/2)
    </p>
    <span className="text-xs text-gray-400">Click chips to remove</span>
  </div>

  {/* Search bar */}
  <div className="relative">
    <input
      type="text"
      placeholder="Search ASL by name or rank..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <svg
      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    {searchQuery && (
      <button
        onClick={() => setSearchQuery('')}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>

  {/* Selected ASLs chips */}
  {squadData.assistantSquadLeaderIds.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {squadData.assistantSquadLeaderIds.map((id) => {
        const member = allMembers.find((m) => m.id === id);
        if (!member) return null;
        return (
          <div
            key={id}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-200"
            onClick={() => {
              setSquadData({
                ...squadData,
                assistantSquadLeaderIds: squadData.assistantSquadLeaderIds.filter((mId) => mId !== id),
              });
            }}
          >
            {member.name} ×
          </div>
        );
      })}
    </div>
  )}

  {/* ASL List grouped by rank */}
  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-2">
    {Object.values(Rank).map((rank) => {
      // Filter members by rank, not in another squad, and search query
      const membersInRank = getAvailableForRole('asl')
        .filter((m) => m.rank === rank)
        .filter((m) => !m.currentSquad || m.currentSquad === currentSquadNum)
        .filter((m) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return m.name.toLowerCase().includes(q) || m.rank.toLowerCase().includes(q);
        });

      if (membersInRank.length === 0) return null;

      return (
        <div key={rank} className="space-y-1">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{rank}</span>
            <span className="text-xs text-gray-400">({membersInRank.length})</span>
          </div>

          {membersInRank.map((member) => {
            const isSelected = squadData.assistantSquadLeaderIds.includes(member.id);

            return (
              <label
                key={member.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer ml-2"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {
                    let updated = [...squadData.assistantSquadLeaderIds];
                    if (isSelected) {
                      updated = updated.filter((id) => id !== member.id);
                    } else {
                      if (updated.length >= 2) return; // limit to 2
                      updated.push(member.id);
                    }
                    setSquadData({ ...squadData, assistantSquadLeaderIds: updated });
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="flex-1">{member.name}</span>
                {member.currentSquad && member.currentSquad !== currentSquadNum && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Squad {member.currentSquad}</span>
                )}
              </label>
            );
          })}
        </div>
      );
    })}
  </div>
</div>

          {/* Members with Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Squad Members
              </label>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or rank..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {searchQuery 
                    ? `No members found matching "${searchQuery}"`
                    : 'No members available (all members are assigned to other squads)'}
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.values(Rank).map((rank) => {
                    const membersInRank = filteredMembers.filter(m => m.rank === rank);
                    if (membersInRank.length === 0) return null;
                    
                    return (
                      <div key={rank} className="space-y-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {rank}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({membersInRank.length})
                          </span>
                        </div>
                        {membersInRank.map((member) => (
                          <label
                            key={member.id}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer ml-2"
                          >
                            <input
                              type="checkbox"
                              checked={!!squadData.members?.[member.id]}
                              onChange={() => toggleMember(member.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="flex-1">
                              {member.name}
                            </span>
                            {member.currentSquad === currentSquadNum && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Current
                              </span>
                            )}
                            {!member.currentSquad && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Unassigned
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>
                {selectedMemberCount} member(s) selected
                {searchQuery && ` • Showing ${filteredMembers.length} of ${getAvailableForMembers().length} available`}
              </span>
              <span className="text-xs">
                Target: 10 members per squad
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving...' : 'Save Squad'}
            </button>
            <button
              onClick={() => navigate('/squad')}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SquadDetail;
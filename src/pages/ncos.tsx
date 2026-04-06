import { useState, useEffect } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import app from '../firebase/firebase';
import { Member, MemberStatus, SelectedBadge } from '../enum';
import { BadgeSelection } from './Badgelist';

const BadgeManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberBadges, setMemberBadges] = useState<SelectedBadge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (selectedMemberId) {
      loadMemberBadges(selectedMemberId);
    }
  }, [selectedMemberId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const db = getDatabase(app);
      const membersSnap = await get(ref(db, 'members'));

      if (membersSnap.exists()) {
        const membersData = membersSnap.val();
        const membersList = Object.entries(membersData)
          .map(([id, data]: [string, any]) => ({
            ...data,
            id,
          } as Member))
          .filter((m) => m.status === MemberStatus.ACTIVE)
          .sort((a, b) => a.name.localeCompare(b.name));

        setMembers(membersList);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMemberBadges = async (memberId: string) => {
    try {
      const db = getDatabase(app);
      const member = members.find((m) => m.id === memberId);
      setSelectedMember(member || null);

      // Load member's badges
      const badgesSnap = await get(ref(db, `memberBadges/${memberId}`));
      if (badgesSnap.exists()) {
        const badgesData = badgesSnap.val();
        setMemberBadges(badgesData.badges || []);
      } else {
        setMemberBadges([]);
      }
    } catch (error) {
      console.error('Error loading member badges:', error);
      setMemberBadges([]);
    }
  };

  const handleSaveBadges = async () => {
    if (!selectedMemberId) {
      alert('Please select a member');
      return;
    }

    try {
      setSaving(true);
      const db = getDatabase(app);
      await update(ref(db, `memberBadges/${selectedMemberId}`), {
        memberId: selectedMemberId,
        badges: memberBadges,
      });
      alert('Badges saved successfully!');
    } catch (error) {
      console.error('Error saving badges:', error);
      alert('Error saving badges. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getFilteredMembers = () => {
    if (!searchQuery.trim()) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.rank.toLowerCase().includes(query)
    );
  };

  const getBadgeStats = () => {
    const proficiency = memberBadges.filter((b) =>
      b.category.includes('proficiency')
    ).length;
    const service = memberBadges.filter((b) => b.category.includes('service'))
      .length;
    const special = memberBadges.filter((b) => b.category.includes('special'))
      .length;

    return { proficiency, service, special, total: memberBadges.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  };

  const filteredMembers = getFilteredMembers();
  const stats = selectedMemberId ? getBadgeStats() : null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Member Selection */}
      <div className="w-1/3 border-r border-gray-200 bg-white p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Badge Management</h1>
          <p className="text-gray-600 text-sm">Select a member to manage badges</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
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
        </div>

        {/* Member List */}
        <div className="space-y-2">
          {filteredMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No members found</p>
          ) : (
            filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedMemberId === member.id
                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-600">
                  {member.rank}
                  {member.currentSquad && ` • Squad ${member.currentSquad}`}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Badge Management */}
      <div className="flex-1 overflow-y-auto">
        {!selectedMemberId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Member Selected
              </h3>
              <p className="text-gray-600">
                Select a member from the list to manage their badges
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Member Info Header - Sticky */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 shadow-sm z-10">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedMember?.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedMember?.rank}
                      {selectedMember?.currentSquad &&
                        ` • Squad ${selectedMember.currentSquad}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    {stats && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {stats.total}
                          </div>
                          <div className="text-xs text-gray-600">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">
                            {stats.proficiency}
                          </div>
                          <div className="text-xs text-gray-600">Proficiency</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">
                            {stats.service}
                          </div>
                          <div className="text-xs text-gray-600">Service</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-amber-600">
                            {stats.special}
                          </div>
                          <div className="text-xs text-gray-600">Special</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setSelectedMemberId('')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    ← Back to List
                  </button>
                  <button
                    onClick={handleSaveBadges}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Badges'}
                  </button>
                </div>
              </div>
            </div>

            {/* Badge Selection Component */}
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <BadgeSelection
                  selectedBadges={memberBadges}
                  setSelectedBadges={setMemberBadges}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeManagement;
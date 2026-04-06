import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import app from '../../firebase/firebase';
import { Member, MemberStatus, Rank, Gender } from '../../enum';

const MemberProfile = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<Member | null>(null);

  useEffect(() => {
    const loadMember = async () => {
      const db = getDatabase(app);
      const snap = await get(ref(db, `members/${memberId}`));
      if (snap.exists()) {
        const memberData = { ...snap.val(), id: memberId } as Member;
        setMember(memberData);
        setEditedMember(memberData);
      }
      setLoading(false);
    };

    loadMember();
  }, [memberId]);

  const handleSave = async () => {
    if (!editedMember || !memberId) return;

    try {
      setSaving(true);
      const db = getDatabase(app);
      
      // Remove id from the data to save
      const { id, ...dataToSave } = editedMember;
      
      await update(ref(db, `members/${memberId}`), dataToSave);
      
      setMember(editedMember);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedMember(member);
    setIsEditing(false);
  };

  const updateField = (field: keyof Member, value: any) => {
    if (!editedMember) return;
    setEditedMember({
      ...editedMember,
      [field]: value,
    });
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case MemberStatus.ACTIVE:
        return 'bg-green-100 text-green-800 border-green-300';
      case MemberStatus.LEAVE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case MemberStatus.MIA:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case MemberStatus.RESIGNED:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRankBadgeColor = (rank: Rank) => {
    switch (rank) {
      case Rank.SGT:
        return 'bg-purple-600 text-white';
      case Rank.CPL:
        return 'bg-blue-600 text-white';
      case Rank.LCPL:
        return 'bg-indigo-600 text-white';
      case Rank.PTE:
        return 'bg-gray-600 text-white';
      case Rank.REC:
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Member Not Found</h2>
          <p className="text-gray-600 mb-6">The member you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/members')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  const displayMember = isEditing ? editedMember! : member;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          {/* Edit/Save/Cancel Buttons */}
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCancel();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 sm:p-8 mb-6 text-white">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              {member.profileImageUrl ? (
                <img
                  src={member.profileImageUrl}
                  alt={member.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <span className={`absolute bottom-0 right-0 px-3 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(displayMember.rank)} shadow-lg`}>
                {isEditing ? (
                  <select
                    value={displayMember.rank}
                    onChange={(e) => updateField('rank', e.target.value as Rank)}
                    className="bg-transparent text-white font-bold text-xs"
                  >
                    <option value={Rank.SGT} className="text-gray-900">{Rank.SGT}</option>
                    <option value={Rank.CPL} className="text-gray-900">{Rank.CPL}</option>
                    <option value={Rank.LCPL} className="text-gray-900">{Rank.LCPL}</option>
                    <option value={Rank.PTE} className="text-gray-900">{Rank.PTE}</option>
                    <option value={Rank.REC} className="text-gray-900">{Rank.REC}</option>
                  </select>
                ) : (
                  displayMember.rank
                )}
              </span>
            </div>

            {/* Name and Status */}
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <input
                  type="text"
                  value={displayMember.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="text-3xl sm:text-4xl font-bold mb-2 w-full bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-white placeholder-white"
                  placeholder="Member Name"
                />
              ) : (
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{displayMember.name}</h1>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {isEditing ? (
                  <select
                    value={displayMember.status}
                    onChange={(e) => updateField('status', e.target.value as MemberStatus)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(displayMember.status)}`}
                  >
                    <option value={MemberStatus.ACTIVE}>{MemberStatus.ACTIVE}</option>
                    <option value={MemberStatus.LEAVE}>{MemberStatus.LEAVE}</option>
                    <option value={MemberStatus.MIA}>{MemberStatus.MIA}</option>
                    <option value={MemberStatus.RESIGNED}>{MemberStatus.RESIGNED}</option>
                  </select>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusColor(displayMember.status)}`}>
                    {displayMember.status}
                  </span>
                )}
                {displayMember.currentSquad && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm">
                    Squad {displayMember.currentSquad}
                  </span>
                )}
                {!displayMember.currentSquad && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm">
                    Unassigned
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Information
            </h2>
            <div className="space-y-3">
              {(displayMember.dob || isEditing) && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Date of Birth</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={displayMember.dob || ''}
                      onChange={(e) => updateField('dob', e.target.value)}
                      className="text-gray-900 font-medium border border-gray-300 rounded px-2 py-1"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">
                      {new Date(displayMember.dob).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })} ({calculateAge(displayMember.dob)} years)
                    </span>
                  )}
                </div>
              )}
              {(displayMember.gender || isEditing) && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Gender</span>
                  {isEditing ? (
                    <select
                      value={displayMember.gender || ''}
                      onChange={(e) => updateField('gender', e.target.value as Gender)}
                      className="text-gray-900 font-medium border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Select Gender</option>
                      <option value={Gender.M}>{Gender.M}</option>
                      <option value={Gender.F}>{Gender.F}</option>
                    </select>
                  ) : (
                    <span className="text-gray-900 font-medium">{displayMember.gender}</span>
                  )}
                </div>
              )}
              {(displayMember.class || isEditing) && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Class</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayMember.class || ''}
                      onChange={(e) => updateField('class', e.target.value)}
                      className="text-gray-900 font-medium border border-gray-300 rounded px-2 py-1 w-40 text-right"
                      placeholder="Class"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{displayMember.class}</span>
                  )}
                </div>
              )}
              {(displayMember.school || isEditing) && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">School</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayMember.school || ''}
                      onChange={(e) => updateField('school', e.target.value)}
                      className="text-gray-900 font-medium border border-gray-300 rounded px-2 py-1 w-40 text-right"
                      placeholder="School"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{displayMember.school}</span>
                  )}
                </div>
              )}
              {(displayMember.religion || isEditing) && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Religion</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayMember.religion || ''}
                      onChange={(e) => updateField('religion', e.target.value)}
                      className="text-gray-900 font-medium border border-gray-300 rounded px-2 py-1 w-40 text-right"
                      placeholder="Religion"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{displayMember.religion}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* BB Information */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              BB Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm font-medium">Rank</span>
                <span className={`px-3 py-1 rounded-md text-sm font-bold ${getRankBadgeColor(displayMember.rank)}`}>
                  {displayMember.rank}
                </span>
              </div>
              {(displayMember.yearJoinedBB || isEditing) && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Joined BB</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayMember.yearJoinedBB || ''}
                      onChange={(e) => updateField('yearJoinedBB', e.target.value)}
                      className="text-gray-900 font-medium border border-gray-300 rounded px-2 py-1 w-32 text-right"
                      placeholder="e.g. 2016 (JR)"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{displayMember.yearJoinedBB}</span>
                  )}
                </div>
              )}
              {(displayMember.yearJoined || isEditing) && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Year Joined</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={displayMember.yearJoined || ''}
                      onChange={(e) => updateField('yearJoined', parseInt(e.target.value))}
                      className="text-gray-900 font-medium border border-gray-300 rounded px-2 py-1 w-24 text-right"
                      placeholder="2016"
                    />
                  ) : (
                    <span className="text-gray-900 font-medium">{displayMember.yearJoined}</span>
                  )}
                </div>
              )}
              {(displayMember.bd || isEditing) && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium">Band/Dancing</span>
                  {isEditing ? (
                    <select
                      value={displayMember.bd || ''}
                      onChange={(e) => updateField('bd', e.target.value)}
                      className="text-gray-900 font-medium border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Select</option>
                      <option value="Band">Band</option>
                      <option value="Dancing">Dancing</option>
                      <option value="N/A">N/A</option>
                    </select>
                  ) : (
                    <span className="text-gray-900 font-medium">{displayMember.bd}</span>
                  )}
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm font-medium">Current Squad</span>
                <span className="text-gray-900 font-medium">
                  {displayMember.currentSquad ? `Squad ${displayMember.currentSquad}` : 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h2>
            <div className="space-y-3">
              {(displayMember.contact || isEditing) && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium block mb-1">Phone Number</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={displayMember.contact || ''}
                      onChange={(e) => updateField('contact', e.target.value)}
                      className="w-full text-gray-900 font-medium border border-gray-300 rounded px-2 py-1"
                      placeholder="Phone number"
                    />
                  ) : (
                    <a
                      href={`tel:${displayMember.contact}`}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {displayMember.contact}
                    </a>
                  )}
                </div>
              )}
              {(displayMember.altContact || isEditing) && (
                <div className="py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm font-medium block mb-1">Alternative Contact</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={displayMember.altContact || ''}
                      onChange={(e) => updateField('altContact', e.target.value)}
                      className="w-full text-gray-900 font-medium border border-gray-300 rounded px-2 py-1"
                      placeholder="Alt contact"
                    />
                  ) : (
                    <a
                      href={`tel:${displayMember.altContact}`}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {displayMember.altContact}
                    </a>
                  )}
                </div>
              )}
              {(displayMember.email || isEditing) && (
                <div className="py-2">
                  <span className="text-gray-600 text-sm font-medium block mb-1">Email</span>
                  {isEditing ? (
                    <input
                      type="email"
                      value={displayMember.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full text-gray-900 font-medium border border-gray-300 rounded px-2 py-1"
                      placeholder="Email address"
                    />
                  ) : (
                    <a
                      href={`mailto:${displayMember.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 break-all"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {displayMember.email}
                    </a>
                  )}
                </div>
              )}
              {!displayMember.contact && !displayMember.altContact && !displayMember.email && !isEditing && (
                <p className="text-gray-500 text-sm italic">No contact information available</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {!isEditing && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/attendance')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  View Attendance
                </button>
                <button
                  onClick={() => navigate('/squad')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  
                  View Squads
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
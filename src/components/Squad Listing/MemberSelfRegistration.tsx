import React, { useState, useEffect } from 'react';
import { saveMember, getMember } from '../../firebase/memberService';
import { Member, MemberStatus, Rank, Gender } from '../../enum';
import { Save, User, Calendar, Phone, Mail, School, Loader } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MemberSelfRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Member ID management
  const [memberId, setMemberId] = useState<string>('');
  
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    name: '',
    rank: Rank.REC,
    status: MemberStatus.ACTIVE,
    class: '',
    gender: undefined,
    yearJoinedBB: '',
    yearJoined: undefined,
    dob: '',
    bd: undefined,
    contact: '',
    altContact: '',
    email: '',
    religion: '',
    school: '',
    profileImageUrl: '',
  });

  // Initialize member ID and load data
  useEffect(() => {
    const initializeMember = async () => {
      const storedId = localStorage.getItem('memberId');
      if (storedId) {
        setMemberId(storedId);
        await loadMemberData(storedId);
      } else {
        const newId = 'member_' + Math.random().toString(36).substr(2, 9);
        setMemberId(newId);
        localStorage.setItem('memberId', newId);
        toast.info('New profile created. Fill in your details.');
      }
    };
    
    initializeMember();
  }, []);

const loadMemberData = async (id: string) => {
  setIsLoading(true);
  try {
    const member = await getMember(id);

    if (member) {
      setFormData({
        name: member.name || '',
        rank: member.rank || Rank.REC,
        status: member.status || MemberStatus.ACTIVE,
        class: member.class || '',
        gender: member.gender,
        yearJoinedBB: member.yearJoinedBB || '',
        yearJoined: member.yearJoined,
        dob: member.dob || '',
        bd: member.bd,
        contact: member.contact || '',
        altContact: member.altContact || '',
        email: member.email || '',
        religion: member.religion || '',
        school: member.school || '',
        profileImageUrl: member.profileImageUrl || '',
      });

      toast.success('Loaded existing profile!');
    } else {
      toast.warning('No profile data found.');
    }
  } catch (error) {
    console.error('Error loading member data:', error);
    toast.error('Failed to load profile data');
  } finally {
    setIsLoading(false);
  }
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.dob) {
      toast.error('Date of birth is required');
      return;
    }

    setIsSaving(true);
    try {
      const memberData: Member = {
        id: memberId,
        ...formData
      };

      const result = await saveMember(memberData);
      if (result.success) {
        toast.success('✅ Profile saved successfully!');
      } else {
        toast.error(`❌ ${result.error || 'Failed to save profile'}`);
      }
    } catch (error: any) {
      console.error('Error saving member:', error);
      toast.error('❌ Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-extract year from yearJoinedBB
  useEffect(() => {
    if (formData.yearJoinedBB && !formData.yearJoined) {
      const yearMatch = formData.yearJoinedBB.match(/\b(\d{4})\b/);
      if (yearMatch) {
        setFormData(prev => ({
          ...prev,
          yearJoined: parseInt(yearMatch[1], 10)
        }));
      }
    }
  }, [formData.yearJoinedBB]);

  const handleNewProfile = () => {
    const newId = 'member_' + Math.random().toString(36).substr(2, 9);
    setMemberId(newId);
    localStorage.setItem('memberId', newId);
    
    // Reset form
    setFormData({
      name: '',
      rank: Rank.REC,
      status: MemberStatus.ACTIVE,
      class: '',
      gender: undefined,
      yearJoinedBB: '',
      yearJoined: undefined,
      dob: '',
      bd: undefined,
      contact: '',
      altContact: '',
      email: '',
      religion: '',
      school: '',
      profileImageUrl: '',
    });
    
    toast.info('🆕 New profile started. Fill in your details.');
  };

  const handleLoadProfile = () => {
    const id = prompt('Enter your Member ID:');
    if (id && id.trim()) {
      setMemberId(id.trim());
      localStorage.setItem('memberId', id.trim());
      loadMemberData(id.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Profile</h3>
          <p className="text-gray-600">Fetching your member data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Member Self-Registration</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <p className="text-gray-600">Register or update your member details</p>
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
                    ID: {memberId.substring(0, 10)}...
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={handleLoadProfile}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm hover:shadow-sm"
              >
                Load Profile
              </button>
              <button
                onClick={handleNewProfile}
                className="px-5 py-2.5 border border-blue-200 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-200 font-medium text-sm hover:shadow-sm"
              >
                New Profile
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
            <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2.5 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Your personal identification details</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Rank */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Rank <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="rank"
                    value={formData.rank}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-all duration-200 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-4 bg-[length:16px_16px]"
                  >
                    {Object.values(Rank).map(rank => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-all duration-200 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-4 bg-[length:16px_16px]"
                  >
                    {Object.values(MemberStatus).map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Class
                  </label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                    placeholder="Arete, Aman, Alegria, Agape"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-all duration-200 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-4 bg-[length:16px_16px]"
                  >
                    <option value="">Select gender</option>
                    {Object.values(Gender).map(gender => (
                      <option key={gender} value={gender}>
                        {gender === Gender.M ? 'Male' : 'Female'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Personal Details */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
            <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2.5 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Your contact and personal information</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                  />
                </div>

                {/* Band/Dancing */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Band / Dancing
                  </label>
                  <select
                    name="bd"
                    value={formData.bd || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-400 transition-all duration-200 focus:outline-none appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-4 bg-[length:16px_16px]"
                  >
                    <option value="">Select option</option>
                    <option value="Band">Band</option>
                    <option value="Dancing">Dancing</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                    placeholder="e.g., 91234567"
                  />
                </div>

                {/* Alt Contact */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Alternate Contact
                  </label>
                  <input
                    type="tel"
                    name="altContact"
                    value={formData.altContact || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                    placeholder="e.g., 98765432"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Background Information */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all hover:shadow-lg">
            <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2.5 rounded-lg">
                  <School className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Background Information</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Your BB and education background</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Year Joined BB */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Year Joined BB
                  </label>
                  <input
                    type="text"
                    name="yearJoinedBB"
                    value={formData.yearJoinedBB || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                    placeholder="e.g., 2016 (JR)"
                  />
                  <p className="text-xs text-gray-500 mt-2 px-1">
                    Format: Year (Level) - e.g., "2016 (JR)" or "2019 (SR)"
                  </p>
                </div>

                {/* Religion */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Religion
                  </label>
                  <input
                    type="text"
                    name="religion"
                    value={formData.religion || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                    placeholder="e.g., Christian, Buddhist"
                  />
                </div>

                {/* School */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    School
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:outline-none"
                    placeholder="Your current school"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Save Button */}
          <div className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center items-center px-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {isSaving ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-10 text-center">
          <div className="inline-flex flex-col items-center bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-2">
              Your profile is saved to Firebase Database.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700 font-medium">Member ID:</span>
              <code className="font-mono bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg border border-gray-300">
                {memberId}
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Save this ID or use the same device to edit your profile later.
            </p>
          </div>
        </div>

        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="colored"
          pauseOnHover
          closeButton={false}
          toastClassName="rounded-xl shadow-lg"
        />
      </div>
    </div>
  );
};

export default MemberSelfRegistration;
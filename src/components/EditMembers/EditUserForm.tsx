// EditUserForm.tsx
import React from "react";
import { Link } from "react-router-dom";
import { SelectedBadge } from "../../types";
import { Member, MemberStatus, RANK_OPTIONS, Rank } from "../../enum";
import EditBadgeList from "./EditBadgeList";
import { Award } from "lucide-react";

export interface MemberEdits {
  name: string;
  dob: string;
  rank: Rank;
  status: MemberStatus;
  yearJoined: number | null;
}

interface EditUserFormProps {
  member: Member;
  badges: SelectedBadge[];
  saving: boolean;
  onSave: (edits: MemberEdits, badges: SelectedBadge[]) => void;
  onCancel: () => void;
}

const inputClasses =
  "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent";

const EditUserForm: React.FC<EditUserFormProps> = ({
  member,
  badges: initialBadges,
  saving,
  onSave,
  onCancel,
}) => {
  const [name, setName] = React.useState(member.name || "");
  const [dob, setDob] = React.useState(member.dob || "");
  const [rank, setRank] = React.useState<Rank>(member.rank || Rank.REC);
  const [status, setStatus] = React.useState<MemberStatus>(
    member.status || MemberStatus.ACTIVE
  );
  const [yearJoined, setYearJoined] = React.useState(
    member.yearJoined ? String(member.yearJoined) : ""
  );
  const [badges, setBadges] = React.useState<SelectedBadge[]>(initialBadges);
  const [error, setError] = React.useState<string | null>(null);

  const handleAddBadge = (badge: SelectedBadge) => {
    const updatedBadge = badge.category === 'serviceAwards' || badge.category === 'specialAwards'
      ? { ...badge }  // Don't add level for service and special awards
      : { ...badge, level: badge.level || "Basic" };  // Add default level only for other awards

    setBadges((prev) => [...prev, updatedBadge]);
  };

  const handleDeleteBadge = (badgeIndex: number) => {
    setBadges((prev) => prev.filter((_, index) => index !== badgeIndex));
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!dob) {
      setError("Date of birth is required.");
      return;
    }
    const year = yearJoined.trim() ? parseInt(yearJoined, 10) : null;
    if (
      year !== null &&
      (isNaN(year) || year < 2000 || year > new Date().getFullYear())
    ) {
      setError("Year joined must be a year up to the current year.");
      return;
    }

    setError(null);
    onSave({ name: name.trim(), dob, rank, status, yearJoined: year }, badges);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Edit Form */}
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-white">Edit Member</h2>
        </div>
        <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
          {error && (
            <div className="p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Enter full name"
            />
          </div>

          {/* Date of Birth Input */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={`${inputClasses} [color-scheme:dark]`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Rank */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Rank</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as Rank)}
                className={inputClasses}
              >
                {RANK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-gray-300 text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className={inputClasses}
              >
                {Object.values(MemberStatus).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Joined Input */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Year Joined</label>
            <input
              type="number"
              value={yearJoined}
              onChange={(e) => setYearJoined(e.target.value)}
              className={inputClasses}
              placeholder="Enter year joined"
            />
          </div>

          {/* Squad (managed on the squad page so the squad roster stays in step) */}
          <div className="space-y-2">
            <label className="block text-gray-300 text-sm font-medium">Squad Assignment</label>
            <p className="px-4 py-3 bg-gray-700/50 border border-gray-700 rounded-lg text-gray-300">
              {member.currentSquad ? `Squad ${member.currentSquad}` : "Unassigned"}
            </p>
            <p className="text-xs text-gray-400">
              Squads are changed on the squad page.{" "}
              <Link to={`/members/${member.id}`} className="underline hover:text-white">
                Open full profile
              </Link>{" "}
              for contact and other details.
            </p>
          </div>

          <div className="pt-6 border-t border-gray-700 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Badges Section */}
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-white flex items-center">
            <Award className="mr-3" /> Badges
          </h2>
        </div>
        <div className="p-6">
          <EditBadgeList
            badges={badges}
            onDeleteBadge={handleDeleteBadge}
            onAddBadge={handleAddBadge}
          />
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;

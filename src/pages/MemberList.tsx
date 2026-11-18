import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Search, Users } from "lucide-react";
import { getAllMembers } from "../firebase/memberService";
import { Member, MemberStatus, Rank } from "../enum";

const RANK_ORDER: Rank[] = [Rank.SGT, Rank.CPL, Rank.LCPL, Rank.PTE, Rank.REC];

const STATUS_STYLES: Record<string, string> = {
  [MemberStatus.ACTIVE]: "bg-green-100 text-green-800",
  [MemberStatus.LEAVE]: "bg-orange-100 text-orange-800",
  [MemberStatus.MIA]: "bg-yellow-100 text-yellow-800",
  [MemberStatus.RESIGNED]: "bg-gray-200 text-gray-700",
};

const selectClasses =
  "px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const MemberList = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | MemberStatus>("all");
  const [filterRank, setFilterRank] = useState<"all" | Rank>("all");
  // "all", "0" for unassigned, or a squad number
  const [filterSquad, setFilterSquad] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        setMembers(await getAllMembers());
      } catch (err) {
        console.error("Error loading members:", err);
        setError("Failed to load members. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return members
      .filter((m) => {
        if (query && !(m.name || "").toLowerCase().includes(query)) return false;
        if (filterStatus !== "all" && m.status !== filterStatus) return false;
        if (filterRank !== "all" && m.rank !== filterRank) return false;
        if (filterSquad === "0" && m.currentSquad) return false;
        if (
          filterSquad !== "all" &&
          filterSquad !== "0" &&
          m.currentSquad !== Number(filterSquad)
        )
          return false;
        return true;
      })
      .sort((a, b) => {
        const rankDiff =
          RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank);
        if (rankDiff !== 0) return rankDiff;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [members, searchQuery, filterStatus, filterRank, filterSquad]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">Loading members...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate("/member")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-blue-600" />
              Members
            </h1>
            <p className="text-sm text-gray-600">
              {members.length} member{members.length === 1 ? "" : "s"} in total
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | MemberStatus)
              }
              className={selectClasses}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              {Object.values(MemberStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={filterRank}
              onChange={(e) => setFilterRank(e.target.value as "all" | Rank)}
              className={selectClasses}
              aria-label="Filter by rank"
            >
              <option value="all">All Ranks</option>
              {RANK_ORDER.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>

            <select
              value={filterSquad}
              onChange={(e) => setFilterSquad(e.target.value)}
              className={selectClasses}
              aria-label="Filter by squad"
            >
              <option value="all">All Squads</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  Squad {num}
                </option>
              ))}
              <option value="0">Unassigned</option>
            </select>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {filteredMembers.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              {members.length === 0
                ? "No members have been added yet."
                : "No members match your filters."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 text-left hover:bg-gray-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {member.rank} •{" "}
                        {member.currentSquad
                          ? `Squad ${member.currentSquad}`
                          : "Unassigned"}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_STYLES[member.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {member.status || "Unknown"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberList;

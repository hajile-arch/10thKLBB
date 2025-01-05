import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { getDataFromFirebase } from "../../firebase/firebaseUtils";
import { Link } from "react-router-dom";

type RankCounts = {
  rank: string;
  count: number;
};

const rankColors: Record<string, string> = {
  Sergeant: "bg-gradient-to-br from-gray-700 to-gray-800",
  Corporal: "bg-gradient-to-br from-gray-700 to-gray-800",
  "Lance Corporal": "bg-gradient-to-br from-gray-700 to-gray-800",
  Private: "bg-gradient-to-br from-gray-700 to-gray-800",
};

// const rankIcons: Record<string, string> = {
//   Sergeant: "◆◆◆",
//   Corporal: "◆◆",
//   "Lance Corporal": "◆",
//   Private: "▪",
// };

const UserAnalytics = () => {
  const [rankData, setRankData] = useState<RankCounts[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getDataFromFirebase("users");
      if (result.success && result.data) {
        const rankCounts: Record<string, number> = {
          Sergeant: 0,
          Corporal: 0,
          "Lance Corporal": 0,
          Private: 0,
        };

        Object.values(result.data).forEach((user: any) => {
          if (user.rank && user.rank !== "Recruit") {
            rankCounts[user.rank]++;
          }
        });

        const data = Object.entries(rankCounts).map(([rank, count]) => ({
          rank,
          count
        }));

        setRankData(data);
        setTotalUsers(Object.values(rankCounts).reduce((a, b) => a + b, 0));
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="col-span-4 bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-gray-200">NCOs by Rank</h3>
          <div className="text-sm text-gray-500">
            Total NCOs: {totalUsers.toLocaleString()}
          </div>
        </div>
        <Link to="/ncos" className="p-2 ">
          <MoreVertical className="h-5 w-5 text-white" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {rankData.map(({ rank, count }) => (
          <div
            key={rank}
            className={`${rankColors[rank]} p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors`}
          >
            <div className="flex items-center space-x-2">
              {/* <span className="text-gray-400 text-sm">{rankIcons[rank]}</span> */}
              <span className="text-gray-300 font-medium">{rank}</span>
            </div>
            <div className="text-2xl font-bold text-gray-100">
              {count.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              {((count / totalUsers) * 100).toFixed(1)}% of total
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAnalytics;
import {
  Search,
  Bell,
  Sun,
  LayoutDashboard,
  BarChart2,
  Users,
  Mail,
  Calendar,
  Settings,
  MoreVertical,
  LogOut,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/Members/Sidebar";
import MemberHeader from "../components/Members/MemberHeader";
import ThemeCard from "../components/Members/Theme";
import { useEffect, useState } from "react";
import { getDataFromFirebase } from "../firebase/firebaseUtils";
import UpcomingEvent from "../components/Members/UpcomingEvent";
import UserAnalytics from "../components/Members/MembersCount";
import SquadListing from "../components/Members/SquadListing";


const MembersDashboard = () => {
  const [upcomingEvent, setUpcomingEvent] = useState<any | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await getDataFromFirebase("events");
      if (response.success && response.data) {
        const eventsArray = Object.entries(response.data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        const sortedEvents = eventsArray.sort(
          (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        );
        const nextEvent = sortedEvents.find(
          (event) => new Date(event.startDateTime) > new Date()
        );
        setUpcomingEvent(nextEvent);
      }
    };

    fetchEvents();
  }, []);
  // Sample data for charts
  const salesData = [
    { day: "Sun", value: 5 },
    { day: "Mon", value: 8 },
    { day: "Tue", value: 12 },
    { day: "Wed", value: 15 },
    { day: "Thu", value: 25 },
    { day: "Fri", value: 18 },
    { day: "Sat", value: 10 },
  ];

  const analyticsData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: Math.floor(Math.random() * 45000) + 15000,
  }));

  const invoices = [
    {
      id: "001",
      name: "John Smith",
      date: "31 Aug 2023",
      amount: "$3,230.2",
      status: "Paid",
    },
    {
      id: "002",
      name: "Sarah Wilson",
      date: "30 Aug 2023",
      amount: "$5,630.5",
      status: "Unpaid",
    },
    {
      id: "003",
      name: "Mike Johnson",
      date: "30 Aug 2023",
      amount: "$4,230.0",
      status: "Paid",
    },
    {
      id: "004",
      name: "Emily Brown",
      date: "29 Aug 2023",
      amount: "$3,082.2",
      status: "Paid",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Sidebar></Sidebar>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <MemberHeader></MemberHeader>

        {/* Grid Layout */}
        <div className="grid grid-cols-12 gap-6">

          {/* Upcoming Event */}
        <UpcomingEvent />

          {/* Profit Card */}
          <ThemeCard></ThemeCard>
          
          
          {/* Analytics */}
          <UserAnalytics></UserAnalytics>

          {/* Invoices */}
          <div className="col-span-8 bg-gray-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium">Invoices</h3>
              <button className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
                Report
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm">
                  <th className="text-left pb-4">Name</th>
                  <th className="text-left pb-4">Date</th>
                  <th className="text-left pb-4">Amount</th>
                  <th className="text-left pb-4">Status</th>
                  <th className="text-left pb-4"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-gray-700">
                    <td className="py-4">{invoice.name}</td>
                    <td className="py-4 text-gray-400">{invoice.date}</td>
                    <td className="py-4">{invoice.amount}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          invoice.status === "Paid"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-orange-500/20 text-orange-500"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-gray-400 hover:text-white">
                        More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Activity */}
          <SquadListing></SquadListing>
        </div>
      </div>
    </div>
  );
};

export default MembersDashboard;

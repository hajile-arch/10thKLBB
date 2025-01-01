import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { getDataFromFirebase } from "../../firebase/firebaseUtils";

interface Parade {
  date: string;
}

interface ParadesByMonth {
  [month: string]: {
    [key: string]: Parade;
  };
}

const ParadeList = () => {
  const [parades, setParades] = useState<ParadesByMonth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const fetchParades = async () => {
      const result = await getDataFromFirebase("parades");
      if (result.success) {
        setParades(result.data as ParadesByMonth);
      }
      setLoading(false);
    };
    fetchParades();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Calendar className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const getParadeCount = (month: string) => {
    if (!parades || !parades[month]) return 0;
    return Object.keys(parades[month]).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          2025 Parade Calendar
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {months.map((month) => (
            <div key={month} className="relative group">
              <button
                onClick={() =>
                  setSelectedMonth(selectedMonth === month ? null : month)
                }
                className={`w-full aspect-square p-4 rounded-xl transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm
                  ${
                    selectedMonth === month
                      ? "bg-white/90 shadow-xl scale-105 border-2 border-blue-400"
                      : "bg-white/60 hover:bg-white/80 hover:shadow-lg border border-white/50"
                  }
                  ${
                    getParadeCount(month) > 0 ? "ring-2 ring-blue-200/50" : ""
                  }`}
              >
                <span className="text-2xl font-bold mb-2 text-gray-800">
                  {month}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    getParadeCount(month) > 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getParadeCount(month)}{" "}
                  {getParadeCount(month) === 1 ? "Parade" : "Parades"}
                </span>
              </button>

              {/* Popup for selected month */}
              <div
                className={`absolute top-full left-0 right-0 mt-2 z-10 
                ${selectedMonth === month ? "block" : "hidden"} 
                bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/50 p-6`}
                style={{ width: "calc(100%)" }} // Ensures the popup matches the button width
              >
                <h3 className="font-bold text-xl mb-4 text-gray-800">
                  {month} Parades
                </h3>
                {parades && getParadeCount(month) > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(parades[month]).map(([key, parade]) => (
                      <div
                        key={key}
                        className="bg-blue-50/80 p-4 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors"
                      >
                        <p className="font-bold">
                          {new Date(parade.date).toLocaleDateString("en-US", {
                            // weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-gray-700">
                          {new Date(parade.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })}{" "}
                          GMT+8
                        </p>
                        <p className="text-gray-700 font-medium">Venue: SSIS</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>No parades scheduled for this month. So...</p>
                    <div className="mt-4 text-blue-500">
                      ✨ Keep an eye out for upcoming events! ✨
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParadeList;

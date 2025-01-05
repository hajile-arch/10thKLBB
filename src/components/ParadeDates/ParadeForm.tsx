import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { uploadToFirebase, getDataFromFirebase } from "../../firebase/firebaseUtils";

const validMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type ParadeEntry = {
  date: string;
};

type MonthParades = {
  [key: string]: ParadeEntry;
};

type ExistingParades = {
  [month: string]: MonthParades;
};

const ParadeForm = () => {
  const [month, setMonth] = useState("");
  const [paradeDate, setParadeDate] = useState("");
  const [existingParades, setExistingParades] = useState<ExistingParades>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  useEffect(() => {
    const fetchExistingParades = async () => {
      const result = await getDataFromFirebase("parades");
      if (result.success) {
        console.log("Existing parades fetched:", result.data); // Debugging
        setExistingParades(result.data || {});
      } else {
        console.error("Failed to fetch existing parades.");
      }
    };
    fetchExistingParades();
  }, []);

  const checkForDuplicates = (newParadeDate: Date) => {
    return Object.values(existingParades).some(monthData => 
      Object.values(monthData).some(parade => {
        const existingDate = new Date(parade.date);
        return existingDate.toDateString() === newParadeDate.toDateString();
      })
    );
  };
  

  const validateForm = () => {
    try {
      const selectedDate = new Date(paradeDate);
      const now = new Date();

      if (!month || !validMonths.includes(month)) {
        setErrorMessage("Please select a valid month.");
        return false;
      }

      if (!paradeDate) {
        setErrorMessage("Please select a parade date and time.");
        return false;
      }

      if (isNaN(selectedDate.getTime())) {
        setErrorMessage("Invalid date format. Please select a valid date.");
        return false;
      }

      if (selectedDate <= now) {
        setErrorMessage("Parade date must be in the future.");
        return false;
      }

      if (selectedDate.getFullYear() !== 2025) {
        setErrorMessage("Parades can only be scheduled for 2025.");
        return false;
      }

      if (checkForDuplicates(selectedDate)) {
        setErrorMessage("A parade is already scheduled for this date. Please choose another.");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Validation error:", error);
      setErrorMessage("An unexpected error occurred during validation.");
      return false;
    }
  };

  const handleAddParade = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const path = `parades/${month}`;
      const data = { date: paradeDate };
      const result = await uploadToFirebase(path, data);

      if (result.success) {
        setSuccessMessage("Parade successfully scheduled! 🎉");
        setMonth("");
        setParadeDate("");
      } else {
        setErrorMessage("Unable to schedule parade. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error during form submission:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Schedule a Parade</h2>

        <form onSubmit={handleAddParade} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Select Month
              </label>
              <div className="relative">
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option value="">Choose a month...</option>
                  {validMonths.map((monthName) => (
                    <option key={monthName} value={monthName}>
                      {monthName}
                    </option>
                  ))}
                </select>
                <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="paradeDate" className="block text-sm font-medium text-gray-700 mb-1">
                Select Date and Time
              </label>
              <div className="relative">
                <input
                  id="paradeDate"
                  type="datetime-local"
                  value={paradeDate}
                  onChange={(e) => setParadeDate(e.target.value)}
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <Clock className="absolute right-3 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Parade"}
          </button>
        </form>

        {successMessage && (
          <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParadeForm;

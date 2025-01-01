import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { uploadToFirebase } from "../../firebase/firebaseUtils";

const validMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ParadeForm = () => {
  const [month, setMonth] = useState("");
  const [paradeDate, setParadeDate] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (month) {
      const monthIndex = validMonths.indexOf(month);
      const date = new Date(2025, monthIndex, 1); // 1st day of the selected month in 2025
      const formattedDate = formatDateForInput(date);
      setParadeDate(formattedDate);
    }
  }, [month]);

  const formatDateForInput = (date: Date) => {
    // Ensure the date is in the correct format (YYYY-MM-DDTHH:mm)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validateForm = () => {
    if (!month || !validMonths.includes(month)) {
      setErrorMessage("Please select a valid month.");
      return false;
    }

    if (!paradeDate) {
      setErrorMessage("Parade date is required.");
      return false;
    }

    const now = new Date();
    const selectedDate = new Date(paradeDate);
    
    if (selectedDate <= now) {
      setErrorMessage("Parade date must be in the future.");
      return false;
    }

    if (selectedDate.getFullYear() !== 2025) {
      setErrorMessage("The parade must be scheduled for 2025.");
      return false;
    }

    return true;
  };

  const handleAddParade = async (e: { preventDefault: () => void; }) => {
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
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDatePreview = (dateString: string | number | Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Schedule a Parade
        </h2>
        
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
              {paradeDate && (
                <p className="mt-2 text-sm text-gray-600">
                  Scheduled for: {formatDatePreview(paradeDate)}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 
              ${isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}`}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Parade'}
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

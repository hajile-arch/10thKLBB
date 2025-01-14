import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  Package,
  FileText,
} from "lucide-react";
import { getDataFromFirebase } from "../firebase/firebaseUtils";
import { useNavigate } from "react-router-dom";

interface Event {
  id: string;
  name: string;
  startDateTime: string;
  endDateTime: string;
  primaryOic: string;
  secondaryOic?: string;
  ncoic: string;
  venue: string;
  thingsToBring: string;
  programme: string;
}

interface CalendarDay {
    day: number | string;
    empty?: boolean;
    events?: Event[];
    hasEvents?: boolean;
    isWithinEventRange?: boolean; // Add this property
  }
  

interface DateRange {
  dateRange: string;
  duration: string;
}

const EventCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const navigate=useNavigate();

  const handleBack=()=>{
    navigate(-1);
  }


  // Fetch events from Firebase
  useEffect(() => {
    const fetchEvents = async () => {
      const fetchedData = await getDataFromFirebase("events");
  
      console.log("Fetched data:", fetchedData);
      console.log("Fetched events data:", fetchedData.data);
  
      if (fetchedData.success && fetchedData.data) {
        // Convert the object into an array of events
        const eventsArray: Event[] = Object.values(fetchedData.data); // Explicitly type as Event[]
        console.log("Converted events array:", eventsArray);
        setEvents(eventsArray); // Set the events state with the array
      } else {
        console.error("Error fetching events:", fetchedData.message || "Unknown error");
      }
    };
    fetchEvents();
  }, []);
  
  
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getMonthDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const totalDays = getDaysInMonth(currentDate);
  
    // Fill in the empty days from the start of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: "", empty: true });
    }
  
    // Helper function to check if a day is within an event's date range
    const isWithinRange = (event: Event, date: Date): boolean => {
      const start = new Date(event.startDateTime);
      const end = new Date(event.endDateTime);
      const checkDate = new Date(date);
  
      // Normalize the dates to ignore the time portion
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      checkDate.setHours(0, 0, 0, 0);
  
      // Check if the checkDate is within the event's start and end date
      return checkDate >= start && checkDate <= end;
    };
  
    // Loop through each day of the month and check for events
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const eventsOnDay = events.filter((event) => isWithinRange(event, date)); // Filter events within the range
  
      days.push({
        day,
        events: eventsOnDay, // Attach the list of events for that day
        hasEvents: eventsOnDay.length > 0, // Whether the day has events
      });
    }
  
    return days;
  };
  
  
  const formatDateRange = (start: string, end: string): DateRange => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const formatTime = (date: Date): string => {
      return date
        .toLocaleString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(",", "");
    };

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return {
      dateRange: `${formatTime(startDate)} to ${formatTime(endDate)}`,
      duration: `${days[startDate.getDay()]} to ${days[endDate.getDay()]}`,
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url("/images/calendar.png")`, }}>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() - 1))
              )
            }
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} />
          </button>
  
          <h2 className="text-xl font-bold">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h2>
  
          <button
            onClick={() =>
              setCurrentDate(
                new Date(currentDate.setMonth(currentDate.getMonth() + 1))
              )
            }
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight size={24} />
          </button>
        </div>
  
        <div className="grid grid-cols-7 gap-2 mb-4 text-center font-medium">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2">
              {day}
            </div>
          ))}
        </div>
  
        <div className="grid grid-cols-7 gap-2">
          {getMonthDays().map((date, index) => (
            <div
              key={index}
              className={`p-2 min-h-16 border rounded-lg ${
                date.empty
                  ? "bg-gray-50"
                  : date.isWithinEventRange
                  ? "bg-indigo-100 hover:bg-indigo-200 cursor-pointer"
                  : date.hasEvents
                  ? "bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                if (date.hasEvents && date.events?.length) {
                  setSelectedEvent(date.events[0]);
                } else {
                  setSelectedEvent(null); // If no events, clear selected event
                }
              }}
            >
              <div className="font-medium">{date.day}</div>
              {date.hasEvents && date.events?.length && (
                <div className="mt-1">
                {date.events.map((event, index) => (
                  <div
                    key={index}
                    className="text-xs bg-indigo-500 text-white px-1 py-0.5 rounded mb-1 truncate hover:tooltip"
                    title={event.name} // Tooltip will show full name on hover
                  >
                    {event.name}
                  </div>
                ))}
              </div>
              
              )}
            </div>
          ))}
        </div>
  
        {selectedEvent && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedEvent.name}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
  
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  {(() => {
                    const { dateRange, duration } = formatDateRange(
                      selectedEvent.startDateTime,
                      selectedEvent.endDateTime
                    );
                    return (
                      <div>
                        <p className="font-medium">{dateRange}</p>
                        <p className="text-sm text-gray-500">{duration}</p>
                      </div>
                    );
                  })()}
                </div>
  
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={18} />
                  <div>
                    <p>
                      <span className="font-medium">Primary OIC:</span>{" "}
                      {selectedEvent.primaryOic}
                    </p>
                    {selectedEvent.secondaryOic && (
                      <p>
                        <span className="font-medium">Secondary OIC:</span>{" "}
                        {selectedEvent.secondaryOic}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">NCO IC:</span>{" "}
                      {selectedEvent.ncoic}
                    </p>
                  </div>
                </div>
  
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} />
                  <p>
                    <span className="font-medium">Venue:</span>{" "}
                    {selectedEvent.venue}
                  </p>
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-gray-700">
                    <Package size={18} />
                    <span className="font-medium">Things to Bring</span>
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {selectedEvent.thingsToBring}
                  </div>
                </div>
  
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-gray-700">
                    <FileText size={18} />
                    <span className="font-medium">Programme</span>
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {selectedEvent.programme}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default EventCalendar;

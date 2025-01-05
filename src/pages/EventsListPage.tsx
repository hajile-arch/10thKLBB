import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock, Package, FileText } from "lucide-react";
import {
  getDataFromFirebase,
  deleteDataFromFirebase,
} from "../firebase/firebaseUtils";

interface Event {
  id: string;
  name: string;
  startDateTime: string;
  endDateTime: string;
  thingsToBring: string;
  primaryOic: string;
  secondaryOic: string;
  venue: string;
  ncoic: string;
  programme: string;
}

const EventsListPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);


  
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const formatTime = (date: Date) => {
      return date.toLocaleString('en-US', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      }).replace(',', '');
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startDay = days[startDate.getDay()];
    const endDay = days[endDate.getDay()];

    return {
      dateRange: `${formatTime(startDate)} to ${formatTime(endDate)}`,
      duration: `${startDay} to ${endDay}`
    };
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const response = await getDataFromFirebase("events");
      if (response.success && response.data) {
        const eventsArray = Object.entries(response.data).map(([id, value]: [string, any]) => ({
          id,
          ...value,
        }));
        setEvents(eventsArray);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      const response = await deleteDataFromFirebase(`events/${id}`);
      if (response.success) {
        setEvents(events.filter((event) => event.id !== id));
      } else {
        alert(response.message);
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedEvent(expandedEvent === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Upcoming Events</h1>
          <Link
            to="/event/new"
            className="bg-indigo-500 text-white py-2 px-6 rounded-lg hover:bg-indigo-600 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Calendar size={20} />
            Add New Event
          </Link>
        </div>

        {loading ? (
          <div className="bg-white shadow-lg rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">No events scheduled yet.</p>
            <Link
              to="/event/new"
              className="mt-4 inline-block text-indigo-500 hover:text-indigo-600"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => {
              const { dateRange, duration } = formatDateRange(event.startDateTime, event.endDateTime);
              const isExpanded = expandedEvent === event.id;
              
              return (
                <li 
                  key={event.id} 
                  className={`bg-white shadow-lg rounded-lg p-6 transition-all duration-300 hover:shadow-xl
                    ${isExpanded ? 'ring-2 ring-indigo-500' : ''}`}
                  onClick={() => toggleExpand(event.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 hover:text-indigo-600 transition-colors">
                      {event.name}
                    </h3>
                    <div className="space-x-2">
                      <Link
                        to={`/event/edit/${event.id}`}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all transform hover:scale-105"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={18} />
                        <div>
                          <p className="font-medium">{dateRange}</p>
                          <p className="text-sm text-gray-500">{duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={18} />
                        <div>
                          <p><span className="font-medium">Primary OIC:</span> {event.primaryOic}</p>
                          {event.secondaryOic && (
                            <p><span className="font-medium">Secondary OIC:</span> {event.secondaryOic}</p>
                          )}
                          <p><span className="font-medium">NCO IC:</span> {event.ncoic}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={18} />
                        <p><span className="font-medium">Venue:</span> {event.venue}</p>
                      </div>
                    </div>

                    <div className={`grid grid-cols-2 gap-4 transition-all duration-300 
                      ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-2'}`}>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-gray-700">
                          <Package size={18} />
                          <span className="font-medium">Things to Bring</span>
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-line">
                          {event.thingsToBring}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-gray-700">
                          <FileText size={18} />
                          <span className="font-medium">Programme</span>
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-line">
                          {event.programme}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventsListPage;
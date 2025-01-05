import React, { useState, useEffect } from "react";
import { MoreVertical, Calendar } from "lucide-react";
import { getDataFromFirebase } from "../../firebase/firebaseUtils";
import { Link } from "react-router-dom";

const UpcomingEvent = () => {
  const [upcomingEvent, setUpcomingEvent] = useState<any | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });

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

  useEffect(() => {
    if (!upcomingEvent) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const eventTime = new Date(upcomingEvent.startDateTime).getTime();
      const distance = eventTime - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setCountdown({ days, hours });
    }, 1000);

    return () => clearInterval(timer);
  }, [upcomingEvent]);

  return (
    <div className="col-span-4 bg-gray-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-medium text-3xl">Upcoming Event 🥳</h3>
          <div className="text-md text-gray-400">Don't miss it!</div>
        </div>
        <Link to="/event" className="p-2 ">
          <MoreVertical className="h-5 w-5 text-white" />
        </Link>
      </div>
      {upcomingEvent ? (
        <div className="border border-gray-600 rounded-lg p-4">
          <h4 className="text-lg font-semibold">{upcomingEvent.name}</h4>
          <p className="text-gray-400 mt-2">
            <Calendar size={16} className="inline-block mr-2" />
            {new Date(upcomingEvent.startDateTime).toLocaleString()}
          </p>
          <p className=" mt-1">
            <span className="font-medium FONT-BOLD">Venue: </span>
            <span className="text-gray-400">{upcomingEvent.venue}</span>
          </p>
          <p className=" mt-1 mb-3">
            <span className="font-medium FONT-BOLD text-white ">NCO In Charge: </span>
            <span className="text-gray-400">{upcomingEvent.ncoic}</span>
          </p>
          <p className="text-sm text-gray-400">
            Time remaining: <span className="font-bold text-green-200">{countdown.days} days {countdown.hours} hours</span>
          </p>
        </div>
      ) : (
        <p className="text-gray-400">No upcoming events scheduled.</p>
      )}
    </div>
  );
};

export default UpcomingEvent;
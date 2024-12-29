import React, { useState, useEffect } from "react";
import {
  uploadToFirebase,
  getDataFromFirebase,
  deleteDataFromFirebase,
} from "../firebase/firebaseUtils"; // Adjust the path to your Firebase utilities file

interface Event {
  id: string; // Firebase-generated unique ID
  date: string;
  description: string;
}

const UpcomingEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({ date: "", description: "" });
  const [loading, setLoading] = useState(false);

  // Fetch events from Firebase on component mount
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

  // Handle input change in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission to add a new event
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.date && formData.description) {
      const response = await uploadToFirebase("events", formData);
      if (response.success) {
        setFormData({ date: "", description: "" }); // Clear the form
        const fetchEvents = await getDataFromFirebase("events");
        if (fetchEvents.success && fetchEvents.data) {
          const eventsArray = Object.entries(fetchEvents.data).map(([id, value]: [string, any]) => ({
            id,
            ...value,
          }));
          setEvents(eventsArray);
        }
      } else {
        alert(response.message);
      }
    }
  };

  // Handle deleting an event
  const handleDeleteEvent = async (id: string) => {
    const response = await deleteDataFromFirebase(`events/${id}`);
    if (response.success) {
      setEvents(events.filter((event) => event.id !== id));
    } else {
      alert(response.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Upcoming Events</h1>

      {/* Add Event Form */}
      <form onSubmit={handleAddEvent} className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="mb-4">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Event Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Event Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
            placeholder="Enter event details..."
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Add Event
        </button>
      </form>

      {/* Display Events */}
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        {loading ? (
          <p className="text-gray-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No events added yet.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id} className="p-4 bg-gray-100 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{event.date}</p>
                  <p className="text-gray-700">{event.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsPage;

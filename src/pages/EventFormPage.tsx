import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  uploadToFirebase,
  getDataFromFirebase,
  updateFirebaseData,
} from "../firebase/firebaseUtils";

interface EventFormData {
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

const EventFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    startDateTime: "",
    endDateTime: "",
    thingsToBring: "",
    primaryOic: "",
    secondaryOic: "",
    venue: "",
    ncoic: "",
    programme: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (id) {
        setLoading(true);
        const response = await getDataFromFirebase(`events/${id}`);
        if (response.success && response.data) {
          setFormData(response.data);
        }
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const eventData = {
      ...formData,
      venue: formData.venue || "TBC",
      ncoic: formData.ncoic || "TBC",
    };

    try {
      if (id) {
        await updateFirebaseData(`events/${id}`, eventData);
      } else {
        await uploadToFirebase("events", eventData);
      }
      navigate("/event");
    } catch (error) {
      alert("Error saving event");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{id ? "Edit Event" : "Add New Event"}</h1>
          <button
            onClick={() => navigate("/event")}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
          >
            Back to Events
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Event Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="primaryOic" className="block text-sm font-medium text-gray-700">
                Primary Officer in Charge*
              </label>
              <input
                type="text"
                id="primaryOic"
                name="primaryOic"
                value={formData.primaryOic}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="secondaryOic" className="block text-sm font-medium text-gray-700">
                Secondary Officer in Charge
              </label>
              <input
                type="text"
                id="secondaryOic"
                name="secondaryOic"
                value={formData.secondaryOic}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="Optional"
              />
            </div>
            <div>
              <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">
                Start Date & Time*
              </label>
              <input
                type="datetime-local"
                id="startDateTime"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700">
                End Date & Time*
              </label>
              <input
                type="datetime-local"
                id="endDateTime"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                Venue
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="TBC if not specified"
              />
            </div>
            <div>
              <label htmlFor="ncoic" className="block text-sm font-medium text-gray-700">
                NCO in Charge
              </label>
              <input
                type="text"
                id="ncoic"
                name="ncoic"
                value={formData.ncoic}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                placeholder="TBC if not specified"
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="thingsToBring" className="block text-sm font-medium text-gray-700">
              Things to Bring*
            </label>
            <textarea
              id="thingsToBring"
              name="thingsToBring"
              value={formData.thingsToBring}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              placeholder="List items participants need to bring..."
              required
            />
          </div>
          <div className="mt-4">
            <label htmlFor="programme" className="block text-sm font-medium text-gray-700">
              Programme*
            </label>
            <textarea
              id="programme"
              name="programme"
              value={formData.programme}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              placeholder="Enter event programme details..."
              required
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/event")}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Saving..." : id ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;
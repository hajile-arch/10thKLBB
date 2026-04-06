import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  uploadToFirebase,
  getDataFromFirebase,
  updateFirebaseData,
} from "../firebase/firebaseUtils";

import { EventFormData } from "../types";

const EventFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    startDateTime: "",
    endDateTime: "",
    thingsToBring: "",
    primaryOic: "",
    venue: "",
    ncoic: "",
    programme: "",
  });

  const [errors, setErrors] = useState<{ startDateTime?: string; endDateTime?: string }>({});
  const [startMin, setStartMin] = useState<string>("");

  // Helpers to convert between Date/ISO and datetime-local (YYYY-MM-DDTHH:MM)
  const pad = (n: number) => String(n).padStart(2, "0");
  const toDateTimeLocal = (d: Date) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const isoToDateTimeLocal = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return toDateTimeLocal(d);
  };
  const dateTimeLocalToISO = (dtLocal: string) => {
    if (!dtLocal) return "";
    const d = new Date(dtLocal);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  };

  // Set minimum for start to now
  useEffect(() => {
    setStartMin(toDateTimeLocal(new Date()));
  }, []);

  // Fetch event for edit and convert ISO -> datetime-local for inputs
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      setLoading(true);
      const response = await getDataFromFirebase(`events/${id}`);
      if (response.success && response.data) {
        const fetched = response.data as Partial<EventFormData>;
        setFormData({
          name: fetched.name || "",
          startDateTime: isoToDateTimeLocal(fetched.startDateTime as string),
          endDateTime: isoToDateTimeLocal(fetched.endDateTime as string),
          thingsToBring: fetched.thingsToBring || "",
          primaryOic: fetched.primaryOic || "",
          venue: fetched.venue || "",
          ncoic: fetched.ncoic || "",
          programme: fetched.programme || "",
        });
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  // Simple validation:
  // - start >= now
  // - end >= now
  // - end > start
  const validateSimple = (data: EventFormData) => {
    const e: typeof errors = {};
    const now = new Date();
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);

    if (!data.startDateTime) {
      e.startDateTime = "Start date & time is required";
    } else if (isNaN(start.getTime())) {
      e.startDateTime = "Invalid start date/time";
    } else if (start < now) {
      e.startDateTime = "Start cannot be before today's date & time";
    }

    if (!data.endDateTime) {
      e.endDateTime = "End date & time is required";
    } else if (isNaN(end.getTime())) {
      e.endDateTime = "Invalid end date/time";
    } else if (end < now) {
      e.endDateTime = "End cannot be before today's date & time";
    }

    // Only compare if start and end are valid
    if (!e.startDateTime && !e.endDateTime) {
      if (end <= start) {
        e.endDateTime = "End must be after Start";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Live validate when inputs change
  useEffect(() => {
    // run validation live
    validateSimple(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isValid = validateSimple(formData);
    if (!isValid) {
      setLoading(false);
      return;
    }

    const eventToSave = {
      ...formData,
      startDateTime: dateTimeLocalToISO(formData.startDateTime),
      endDateTime: dateTimeLocalToISO(formData.endDateTime),
      venue: formData.venue || "TBC",
      ncoic: formData.ncoic || "TBC",
    };

    try {
      if (id) {
        await updateFirebaseData(`events/${id}`, eventToSave);
      } else {
        await uploadToFirebase("events", eventToSave);
      }
      navigate("/event");
    } catch (err) {
      console.error("Save error:", err);
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

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{id ? "Edit Event" : "Add New Event"}</h1>
          <button onClick={() => navigate("/event")} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition">
            Back to Events
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Event Name*</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="primaryOic" className="block text-sm font-medium text-gray-700">Officers in Charge*</label>
              <input
                id="primaryOic"
                name="primaryOic"
                value={formData.primaryOic}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">Start Date & Time*</label>
              <input
                type="datetime-local"
                id="startDateTime"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-2 border rounded ${errors.startDateTime ? "border-red-400" : "border-gray-300"}`}
                required
                min={startMin}
              />
              {errors.startDateTime && <p className="text-sm text-red-600 mt-1">{errors.startDateTime}</p>}
            </div>

            <div>
              <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700">End Date & Time*</label>
              <input
                type="datetime-local"
                id="endDateTime"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleInputChange}
                className={`mt-1 block w-full p-2 border rounded ${errors.endDateTime ? "border-red-400" : "border-gray-300"}`}
                required
                // UX: ensure end cannot be earlier than start; min is start or now
                min={formData.startDateTime || startMin}
              />
              {errors.endDateTime && <p className="text-sm text-red-600 mt-1">{errors.endDateTime}</p>}
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700">Venue</label>
              <input id="venue" name="venue" value={formData.venue} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded" placeholder="TBC if not specified" />
            </div>

            <div>
              <label htmlFor="ncoic" className="block text-sm font-medium text-gray-700">NCO in Charge</label>
              <input id="ncoic" name="ncoic" value={formData.ncoic} onChange={handleInputChange} className="mt-1 block w-full p-2 border border-gray-300 rounded" placeholder="TBC if not specified" />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="thingsToBring" className="block text-sm font-medium text-gray-700">Things to Bring*</label>
            <textarea id="thingsToBring" name="thingsToBring" value={formData.thingsToBring} onChange={handleInputChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded" placeholder="List items participants need to bring..." required />
          </div>

          <div className="mt-4">
            <label htmlFor="programme" className="block text-sm font-medium text-gray-700">Programme*</label>
            <textarea id="programme" name="programme" value={formData.programme} onChange={handleInputChange} rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded" placeholder="Enter event programme details..." required />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={() => navigate("/event")} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition">Cancel</button>
            <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading || hasErrors}>
              {loading ? "Saving..." : id ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;

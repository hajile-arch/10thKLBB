
import { useEffect, useState } from "react";
import { getDataFromFirebase, updateFirebaseData } from "../firebase/firebaseUtils";
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Announcement {
    title: string;
    description: string;
    time: string;
    createdAt: string;
  }
  

interface Parade {
  date: string;
  announcements?: {
    [key: string]: {
      title: string;
      description: string;
      time: string;
    };
  };
}

interface ParadesByMonth {
  [month: string]: {
    [key: string]: Parade;
  };
}

interface AnnouncementForm {
  title: string;
  description: string;
  time: string;
}

export const ParadeAnnouncementsPage = () => {
  const [parades, setParades] = useState<ParadesByMonth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnnouncementForm>({
    title: '',
    description: '',
    time: ''
  });
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const fetchParades = async () => {
    try {
      const result = await getDataFromFirebase("parades");
      if (result.success) {
        setParades(result.data as ParadesByMonth);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch parade data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchParades = async () => {
      try {
        const paradesResult = await getDataFromFirebase("parades");
        if (paradesResult.success) {
          setParades(paradesResult.data as ParadesByMonth);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch parade data');
      } finally {
        setLoading(false);
      }
    };

    fetchParades();
  }, []);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openAnnouncementModal = (date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const closeAnnouncementModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setFormData({ title: '', description: '', time: '' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
  
    const month = new Date(selectedDate).toLocaleString('default', { month: 'long' });
    const announcement: Announcement = {
      ...formData,
      createdAt: new Date().toISOString(),
        //   updatedAt: new Date().toISOString(),
    };
  
    const result = await updateFirebaseData(
      `announcements/${month}/${selectedDate}/${Date.now()}`,
      announcement
    );
  
    if (result.success) {
      closeAnnouncementModal();
      await fetchParades();
    } else {
      setError(result.message);
    }
  };
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Calendar className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  // Sort parades by month (January first, December last)
  const sortedParades = parades
    ? Object.entries(parades)
        .flatMap(([_, monthParades]) => 
          Object.entries(monthParades).map(([_, parade]) => parade)
        )
        .sort((a, b) => {
          const monthA = new Date(a.date).getMonth();
          const monthB = new Date(b.date).getMonth();
          return monthA - monthB;
        })
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={handleBack}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="mr-2" />
            Parade Announcements
          </h1>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Date
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {sortedParades.map((parade) => (
              <div key={parade.date} className="bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={() => toggleDate(parade.date)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900">
                      {formatDate(parade.date)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {parade.announcements ? Object.keys(parade.announcements).length : 0} announcements
                    </span>
                  </div>
                  {expandedDates.includes(parade.date) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {expandedDates.includes(parade.date) && (
                  <div className="px-6 pb-4 space-y-4">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => openAnnouncementModal(parade.date)}
                        className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Announcement
                      </button>
                    </div>
                    {parade.announcements && Object.entries(parade.announcements).map(([id, announcement]) => (
                      <div 
                        key={id}
                        className="bg-white rounded-lg p-4 space-y-2 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                          <span className="text-sm text-gray-500">{announcement.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {announcement.description}
                        </p>
                      </div>
                    ))}
                    {(!parade.announcements || Object.keys(parade.announcements).length === 0) && (
                      <div className="text-center py-6 text-gray-500">
                        No announcements yet. Add one to get started.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {sortedParades.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No parade dates scheduled. Click "Add New Date" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Announcement</h2>
              <button 
                onClick={closeAnnouncementModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAnnouncementModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParadeAnnouncementsPage;
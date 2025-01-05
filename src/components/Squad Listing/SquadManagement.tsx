import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, LayoutGrid, List } from 'lucide-react';
import { Squad } from '../../types';
import { Modal } from './Modal';
import { SquadCard } from './SquadCard';
import { SquadForm } from './SquadForm';
import { uploadToFirebase, getDataFromFirebase, updateFirebaseData, deleteDataFromFirebase } from '../../firebase/firebaseUtils';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SquadManagement = () => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Omit<Squad, 'id'>>({
    squadNumber: "",
    squadName: "",
    squadLeader: "",
    squadLeaderRank: "Recruit",
    assistantSquadLeader: "",
    assistantSquadLeaderRank: "Recruit",
    officerOne: "",
    officerTwo: "",
    members: [],
  });

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    setIsLoading(true);
    const result = await getDataFromFirebase('squads');
    if (result.success && result.data) {
      const squadsArray = Object.entries(result.data).map(([id, data]) => ({
        id,
        ...(data as Omit<Squad, 'id'>)
      }));
      setSquads(squadsArray);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSquad) {
      const result = await updateFirebaseData(`squads/${editingSquad.id}`, formData);
      if (result.success) {
        setSquads(prev =>
          prev.map(squad =>
            squad.id === editingSquad.id ? { ...formData, id: squad.id } : squad
          )
        );
      }
    } else {
      const result = await uploadToFirebase('squads', formData);
      if (result.success) {
        await fetchSquads();
      }
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this squad?')) {
      const result = await deleteDataFromFirebase(`squads/${id}`);
      if (result.success) {
        setSquads(prev => prev.filter(squad => squad.id !== id));
      }
    }
  };

  const handleEdit = (squad: Squad) => {
    setEditingSquad(squad);
    setFormData({
      squadName: squad.squadName,
      squadNumber: squad.squadNumber,
      squadLeader: squad.squadLeader,
      squadLeaderRank: squad.squadLeaderRank,
      assistantSquadLeaderRank: squad.assistantSquadLeaderRank,
      assistantSquadLeader: squad.assistantSquadLeader,
      officerOne: squad.officerOne,
      officerTwo: squad.officerTwo,
      members: squad.members
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSquad(null);
    setFormData({
      squadNumber: "",
      squadName: "",
      squadLeader: "",
      squadLeaderRank: "Recruit",
      assistantSquadLeader: "",
      assistantSquadLeaderRank: "Recruit",
      officerOne: "",
      officerTwo: "",
      members: [],
    });
  };

  const filteredSquads = squads.filter(squad =>
    squad.squadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    squad.squadLeader.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/member')}
            className="flex items-center px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Member
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Squad Management</h1>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Squad
            </button>
          </div>
        </div>

        {/* Search and View Toggle Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search squads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredSquads.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">No squads found</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by creating a new squad"}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      New Squad
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Squads Grid/List */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {filteredSquads.map((squad) => (
                <SquadCard
                  key={squad.id}
                  squad={squad}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </>
        )}

        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          title={editingSquad ? 'Edit Squad' : 'Add New Squad'}
        >
          <ToastContainer position="top-right" autoClose={3000} />
          <SquadForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            isEditing={!!editingSquad} 
          />
        </Modal>
      </div>
    </div>
  );
};

export default SquadManagement;
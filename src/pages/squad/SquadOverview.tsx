import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from 'firebase/database';
import app from '../../firebase/firebase';

const SquadOverview = () => {
  const navigate = useNavigate();
  const CURRENT_YEAR = new Date().getFullYear();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');

  const squads = Array.from({ length: 8 }, (_, i) => i + 1);

  const handleResetClick = () => {
    setShowPasswordModal(true);
    setPassword('');
    setError('');
  };

  const handleResetConfirm = async () => {
    if (password !== 'gayyyy') {
      setError('Incorrect password');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to reset ALL member squad assignments? This action cannot be undone.'
    );

    if (!confirmed) {
      setShowPasswordModal(false);
      return;
    }

    try {
      setIsResetting(true);
      setError('');
      const db = getDatabase(app);

      // Get all members
      const membersSnap = await get(ref(db, 'members'));
      if (!membersSnap.exists()) {
        alert('No members found');
        return;
      }

      const membersData = membersSnap.val();
      const updates: { [key: string]: null } = {};

      // Build batch update to remove currentSquad from all members
      Object.keys(membersData).forEach((memberId) => {
        updates[`members/${memberId}/currentSquad`] = null;
      });

      // Execute batch update
      await update(ref(db), updates);

      alert('Successfully reset all squad assignments!');
      setShowPasswordModal(false);
      setPassword('');
    } catch (error) {
      console.error('Error resetting squads:', error);
      setError('Failed to reset squads. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Squads</h1>
            <p className="text-gray-600">Year {CURRENT_YEAR}</p>
          </div>
          <button
            onClick={handleResetClick}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
          >
            Reset All Squads
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {squads.map((num) => (
            <button
              key={num}
              onClick={() => navigate(`/squad/${num}`)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 text-center border"
            >
              <h2 className="text-xl font-semibold">Squad {num}</h2>
            </button>
          ))}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Reset All Squad Assignments</h2>
            <p className="text-gray-600 mb-4">
              This will remove all members from their current squads. Enter the password to continue.
            </p>
            
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleResetConfirm();
                }
              }}
            />
            
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleResetConfirm}
                disabled={isResetting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isResetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setError('');
                }}
                disabled={isResetting}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadOverview;
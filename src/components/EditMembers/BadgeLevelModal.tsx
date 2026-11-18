import React from 'react';

interface BadgeLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (level: "Basic" | "Advanced") => void;
}

const BadgeLevelModal: React.FC<BadgeLevelModalProps> = ({ isOpen, onClose, onSelectLevel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-4">Select Badge Level</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onSelectLevel("Basic")}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Basic
          </button>
          <button
            onClick={() => onSelectLevel("Advanced")}
            className="px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Advanced
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BadgeLevelModal;

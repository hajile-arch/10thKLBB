import React from 'react';

interface BadgeLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (level: "Basic" | "Advanced") => void;
}

const BadgeLevelModal: React.FC<BadgeLevelModalProps> = ({ isOpen, onClose, onSelectLevel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-xl font-semibold mb-4">Select Badge Level</h3>
        <div className="flex justify-around">
          <button
            onClick={() => onSelectLevel("Basic")}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Basic
          </button>
          <button
            onClick={() => onSelectLevel("Advanced")}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Advanced
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BadgeLevelModal;

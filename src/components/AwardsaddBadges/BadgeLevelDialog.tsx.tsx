import React from 'react';
import { Badge, SelectedBadge } from '../../types';

interface BadgeLevelDialogProps {
  open: boolean;
  onClose: () => void;
  levelSelectionOpen: {
    category?: string;
    subCategory?: string;
    badgeKey?: string;
    badge?: Badge;
  } | null;
  selectedBadges: SelectedBadge[];
  addBadgeToSelection: (
    category: string, 
    subCategory: string, 
    badgeKey: string, 
    badge: Badge, 
    level?: 'Basic' | 'Advanced'
  ) => void;
}

export const BadgeLevelDialog: React.FC<BadgeLevelDialogProps> = ({
  open,
  onClose,
  levelSelectionOpen,
  selectedBadges,
  addBadgeToSelection
}) => {
  if (!open || !levelSelectionOpen || !levelSelectionOpen.badge) return null;

  const { badge, category, subCategory, badgeKey } = levelSelectionOpen;
  const description = typeof badge.description === 'object' ? badge.description : {};

  const renderLevelCard = (level: 'Basic' | 'Advanced') => {
    if (!description[level]) return null;

    const isSelected = selectedBadges.some(b => 
      b.category === category &&
      b.subCategory === subCategory &&
      b.badgeKey === badgeKey &&
      b.level === level
    );

    return (
      <div 
        className={`p-4 mb-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
        onClick={() => addBadgeToSelection(
          category!, 
          subCategory!, 
          badgeKey!, 
          badge!, 
          level
        )}
      >
        <h3 className="font-semibold text-gray-800">{level} Level</h3>
        <p className="text-sm text-gray-600 mt-1">
          {description[level]}
        </p>
        {badge.points?.[level] && (
          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {badge.points[level]} pts
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Select Badge Level</h2>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {badge.name}
          </h3>
          
          {renderLevelCard('Basic')}
          {renderLevelCard('Advanced')}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { SelectedBadge } from '../../types';

interface SelectedBadgesListProps {
  selectedBadges: SelectedBadge[];
}

export const SelectedBadgesList: React.FC<SelectedBadgesListProps> = ({ 
  selectedBadges 
}) => {
  if (selectedBadges.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Selected Badges</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedBadges.map((badge, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-800 text-sm md:text-base">
                {badge.name} 
                {badge.level && ` (${badge.level} Level)`}
              </h4>
              {badge.points && badge.level && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {badge.points[badge.level]} pts
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {typeof badge.description === 'object'
                ? badge.description[badge.level || 'Basic']
                : badge.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
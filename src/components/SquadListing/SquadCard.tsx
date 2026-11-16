import React from 'react';
import { Edit2, Trash2, Users, ChevronRight } from 'lucide-react';
import { Squad } from '../../types';

interface SquadCardProps {
  squad: Squad;
  onEdit: (squad: Squad) => void;
  onDelete: (id: string) => Promise<void>;
  viewMode: 'grid' | 'list';
}

export const SquadCard: React.FC<SquadCardProps> = ({
  squad,
  onEdit,
  onDelete,
  viewMode,
}) => {
  const totalMembers = squad.members?.length ?? 0;

  const handleEdit = () => onEdit(squad);
  const handleDelete = () => onDelete(squad.id);

  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-lg ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      {viewMode === 'list' ? (
        <div className="flex items-center w-full p-4 space-x-4">
          {/* Icon Section */}
          <div className="bg-blue-900/50 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-400" />
          </div>

          {/* Squad Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-200">
              {squad.squadName || 'Unnamed Squad'}
            </h3>
            <p className="text-sm text-gray-400 truncate">
              Squad Leader: <span className="text-gray-300">{squad.squadLeader}</span>
            </p>
            <p className="text-sm text-gray-400 truncate">
              Members: <span className="text-gray-300">{totalMembers}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-2 bg-gray-700 rounded-full hover:bg-blue-900/50 text-gray-300 transition-all"
              title="Edit Squad"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 bg-gray-700 rounded-full hover:bg-red-900/50 text-gray-300 transition-all"
              title="Delete Squad"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              className="p-2 bg-gray-700 rounded-full hover:bg-gray-600/50 text-gray-300 transition-all"
              title="View Details"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-200 truncate">
              {squad.squadName || 'Unnamed Squad'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 bg-gray-700 rounded-full hover:bg-blue-900/50 text-gray-300 transition-all"
                title="Edit Squad"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-gray-700 rounded-full hover:bg-red-900/50 text-gray-300 transition-all"
                title="Delete Squad"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Squad Details */}
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              <span className="font-medium text-gray-200">Squad Number:</span>{' '}
              {squad.squadNumber}
            </p>
            <p>
              <span className="font-medium text-gray-200">Squad Leader:</span>{' '}
              {squad.squadLeader}
            </p>
            <p>
              <span className="font-medium text-gray-200">Assistant Leader:</span>{' '}
              {squad.assistantSquadLeader || 'N/A'}
            </p>
            {(squad.officerOne || squad.officerTwo) && (
              <p>
                <span className="font-medium text-gray-200">Officers:</span>{' '}
                {[squad.officerOne, squad.officerTwo].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center text-sm text-gray-400">
              <Users className="h-4 w-4 mr-2" />
              {totalMembers} {totalMembers === 1 ? 'Member' : 'Members'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

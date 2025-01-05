import React from 'react';
import { X } from 'lucide-react';

interface MemberListProps {
  members: string[];
  onRemove: (index: number) => void;
  onAdd: (name: string) => void;
}

export const MemberList = ({ members, onRemove, onAdd }: MemberListProps) => {
  const [newMember, setNewMember] = React.useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.trim()) {
      onAdd(newMember.trim());
      setNewMember('');
    }
  };

  return (
    <div className="space-y-2">
      {members.map((member, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
          <span>{member}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          placeholder="Enter member name"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Add
        </button>
      </div>
    </div>
  );
};

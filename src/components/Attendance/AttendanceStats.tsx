import React from 'react';
import { AttendanceStats as AttendanceStatsType } from '../../types';

interface AttendanceStatsProps {
  stats: AttendanceStatsType;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({
  stats,
  selectedDate,
  onDateChange,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="w-64">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex gap-4">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">Present</div>
          <div className="text-xl font-bold text-green-600">{stats.present}</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">Absent</div>
          <div className="text-xl font-bold text-red-600">{stats.absent}</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-500">Excused</div>
          <div className="text-xl font-bold text-yellow-600">{stats.excused}</div>
        </div>
      </div>
    </div>
  );
};

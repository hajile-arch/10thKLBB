import { Search, Bell, Sun } from 'lucide-react';

const MemberHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search here..."
            className="bg-gray-800 text-gray-100 pl-10 pr-4 py-2 rounded-lg w-64 border border-gray-700"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
        </div>
        <button className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
          <Sun className="h-5 w-5" />
        </button>
        <button className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
          <Bell className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 rounded-lg bg-gray-700"></div>
      </div>
    </div>
  );
};

export default MemberHeader;
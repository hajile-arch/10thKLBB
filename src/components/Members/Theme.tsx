import { MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ThemeCard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && 
          event.target instanceof Node && 
          !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="col-span-4 rounded-2xl p-6 relative overflow-hidden group">
  {/* Background Image */}
  <div
    className="absolute inset-0 transform transition-transform duration-500 group-hover:scale-110"
    style={{
      backgroundImage: 'url("/images/2025-theme.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  />
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/50" />
  
  {/* Content */}
  <div className="relative z-10">
    <div className="flex justify-between items-start">
      <div className="text-white text-3xl font-bold">
        2025 Theme
      </div>
      <div className="relative" ref={dropdownRef}>
        <button 
          className="text-white/80 hover:text-white"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <MoreVertical className="h-5 w-5" />
        </button>
        
        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-3 border-b border-gray-200 font-medium text-black">
              John 15
            </div>
            <div className="py-2">
              <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black font-bold">
                Identity
              </div>
              <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black font-bold">
                Involvement
              </div>
              <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black font-bold">
                Intentions
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

  );
}
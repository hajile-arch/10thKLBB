import React from 'react';
import { Loader2, Construction } from 'lucide-react';

const UnderConstruction = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-600 to-purple-900 flex flex-col items-center justify-center p-4 text-white">
      {/* Main content container */}
      <div className="text-center space-y-8">
        {/* Year display with glow effect */}
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-pink-500 animate-pulse">
          2025
        </h1>
        
        {/* Construction icon and text */}
        <div className="flex items-center justify-center space-x-3">
          <Construction className="w-8 h-8 text-orange-300" />
          <h2 className="text-3xl font-semibold">Under Construction</h2>
          <Construction className="w-8 h-8 text-orange-300" />
        </div>

        {/* Loading animation */}
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-pink-400" />
          <div className="w-64 h-2 bg-purple-800 rounded-full overflow-hidden">
            <div className="w-4/5 h-full bg-orange-400 rounded-full animate-[wiggle_1s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Coming soon text */}
        <p className="text-xl text-orange-100 mt-6">
          Something amazing is coming soon...
        </p>

        {/* Progress percentage */}
        <div className="text-pink-300 font-mono text-lg">
          Loading... 80%
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-sm text-orange-200">
        Please check back later
      </div>
    </div>
  );
};

export default UnderConstruction;
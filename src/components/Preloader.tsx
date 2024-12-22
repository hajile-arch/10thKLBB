import React, { useEffect } from 'react';

interface PreloaderProps {
  onFinish: () => void;  // Callback after preloader finishes
}

const Preloader: React.FC<PreloaderProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();  // Trigger after 5 seconds
    }, 7000);  // Total animation duration
    return () => clearTimeout(timer);  // Clean up timer on unmount
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-black flex justify-center items-center z-50">
      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <img
          src="/images/10thkl-Logo.png"
          alt="10thKL Logo"
          className="w-32 h-auto opacity-0 animate-fade-in animate-logo-slide mt-4"  // Fade-in and slide-in for the logo
        />
        {/* Text */}
        <div className="flex flex-col absolute opacity-0 animate-text-appear mt-4">
          
          <span className="text-white text-4xl font-bold uppercase">10THKL BOYS' BRIGADE  </span>
          <span className="text-white text-4xl font-bold uppercase"></span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;


//   return (
//     <div className="fixed inset-0 bg-black flex justify-center items-center z-50">
//       <div className="flex items-center space-x-4">
//         {/* Logo */}
//         <img
//           src="/images/10thkl-Logo.png"
//           alt="10thKL Logo"
//           className="w-32 h-auto opacity-0 animate-fade-in"
//         />
//         {/* Text container */}
//         <div className="flex flex-col opacity-0 animate-text-appear">
//           <h2 className="text-white text-4xl font-bold uppercase">10THKL</h2>
//           <h2 className="text-white text-4xl font-bold uppercase">BOYS BRIGADE</h2>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Preloader;

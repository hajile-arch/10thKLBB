import { ReactNode, useEffect, useState } from 'react';
import { Laptop, Smartphone, TabletSmartphone, MonitorSmartphone } from 'lucide-react';

interface MobileRedirectProps {
  children: ReactNode;
}

const MobileRedirect: React.FC<MobileRedirectProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    // Trigger fade-in animation
    setTimeout(() => setFadeIn(true), 100);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-blue-100">
          <div className="flex justify-center mb-6 space-x-4">
            <div className="text-blue-500">
              <Smartphone className="w-8 h-8" />
            </div>
            <div className="text-blue-400">
              <TabletSmartphone className="w-8 h-8" />
            </div>
            <div className="text-blue-600">
              <Laptop className="w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Please Switch to Desktop View
          </h2>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 mb-4 leading-relaxed">
              For the best experience, please access our awesome 10th KL website using:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Desktop Computer
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Laptop
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Tablet in Landscape Mode
              </li>
            </ul>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4 text-blue-600">
              <MonitorSmartphone className="w-6 h-6 mr-2" />
              <span className="text-sm font-medium">Optimized for Larger Screens</span>
            </div>
            <p className="text-gray-500 text-sm">
              Our coder is too lazy to create a responsive design but Hey !
              Time is what he has... or does he?
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default MobileRedirect;
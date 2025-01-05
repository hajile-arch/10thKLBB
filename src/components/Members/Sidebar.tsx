import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  House,
  BarChart3,
  Paperclip,
  Key,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: <House className="h-5 w-5" />, label: 'Home', path: '/' },
    { icon: <Users className="h-5 w-5" />, label: 'NCOs', path: '/user' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Attendance', path: '/attendance' },
    {
      icon: <Paperclip className="h-5 w-5" />,
      label: 'Leave Form',
      path: '/leave-form.pdf',
      external: true,
    },
    { icon: <Calendar className="h-5 w-5" />, label: 'Event Calendar', path: '/calendar' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 p-4">
      {/* Logo Section */}
      <Link 
        to="/"
        className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity"
      >
        <img
          src="/images/10thkl-Logo.png"
          alt="10th KL BB Logo"
          className="w-10 h-10 rounded-lg object-cover"
        />
        <span className="text-xl font-bold text-white pl-4">10th KL BB</span>
      </Link>

      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-700 text-white"
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Link>
        {navItems.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              {item.icon}
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              to={item.path}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          )
        )}
      </nav>

      <Link
        to="/secret"
        className="absolute bottom-4 left-4 flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
      >
        <Key className="h-5 w-5" />
        Secret
      </Link>
    </div>
  );
};

export default Sidebar;
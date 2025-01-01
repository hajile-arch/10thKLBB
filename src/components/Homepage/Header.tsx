import { Link } from "react-router-dom";

const Header = () => {
    return (
      <div className="absolute bg-transparent text-white py-4 w-full z-50">
        <div className="flex items-center justify-between px-4">
          {/* Left: Logo */}
          <a href="/" className="flex items-center">
            <img
              src="/images/10thkl-Logo.png"
              alt="Logo"
              className="h-10 w-auto" // Adjust height as needed
            />
          </a>
  
          {/* Center: Navigation Links */}
          <div className="flex justify-center space-x-10">
            <Link
              to="/us"
              className="text-xl hover:text-gray-400 transition duration-300"
            >
              About Us
            </Link>
            <Link
              to="/"
              className="text-xl hover:text-gray-400 transition duration-300"
            >
              2025
            </Link>
            <Link
              to="/users"
              className="text-xl hover:text-gray-400 transition duration-300"
            >
              Members
            </Link>
          </div>
  
          {/* Right: Linktree Logo */}
          <a
            href="https://linktr.ee/10thklbb" // Replace with your Linktree URL
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img
              src="/images/linktree-logo-icon.webp"
              alt="Linktree"
              className="h-8 w-auto"
            />
          </a>
        </div>
      </div>
    );
  };
  
  export default Header;
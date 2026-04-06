import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Header = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navItems = [
    { to: "/us", label: "About Us" },
    { to: "/officer", label: "Officers" },
    { to: "/404", label: "2025" },
    { to: "/member", label: "Members" },
    { to: "/junior", label: "Junior" }
  ];
  
  // Number of items to show at once
  const visibleCount = 3;
  
  // Function to handle scrolling left
  const scrollLeft = () => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === 0) {
        return navItems.length - 1; // Loop to the end
      }
      return prevIndex - 1;
    });
  };
  
  // Function to handle scrolling right
  const scrollRight = () => {
    setActiveIndex((prevIndex) => {
      if (prevIndex === navItems.length - visibleCount) {
        return 0; // Loop to the beginning
      }
      return prevIndex + 1;
    });
  };
  
  // Get visible items based on the active index and wrap around if needed
  const getVisibleItems = () => {
    const result = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (activeIndex + i) % navItems.length;
      result.push(navItems[index]);
    }
    return result;
  };
  
  const visibleItems = getVisibleItems();
  
  return (
    <div className="absolute bg-transparent text-white py-4 w-full z-50">
      <div className="flex items-center justify-between px-4">
        {/* Left: Logo */}
        <a href="/" className="flex items-center">
          <img
            src="/images/10thkl-Logo.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </a>
  
        {/* Center: Navigation Links with scroll buttons */}
        <div className="flex items-center">
          <button 
            onClick={scrollLeft}
            className="text-white hover:text-gray-300 focus:outline-none px-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex justify-center space-x-10 overflow-hidden">
            {visibleItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className="text-xl hover:text-gray-400 transition duration-300 min-w-max"
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <button 
            onClick={scrollRight}
            className="text-white hover:text-gray-300 focus:outline-none px-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
  
        {/* Right: Linktree Logo */}
        <a
          href="https://linktr.ee/10thklbb"
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
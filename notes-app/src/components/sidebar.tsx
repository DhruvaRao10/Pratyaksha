import React, { useState } from 'react';
import { Menu, Plus, Search, File, History, X, ChevronLeft } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sidebarItems = [
    { icon: Plus, label: 'New' },
    { icon: Search, label: 'Search' },
    { icon: File, label: 'Documents' },
    { icon: History, label: 'History' }
  ];

  return (
    <div
      className={`h-screen bg-gray-100 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-16' : 'w-8'
      }`}
    >
      <div className="p-2">
        {isOpen ? (
          <X
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900"
            onClick={toggleSidebar}
          />
        ) : (
          <ChevronLeft
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900"
            onClick={toggleSidebar}
          />
        )}
      </div>
      
      <div className="flex flex-col space-y-4 p-2">
        {sidebarItems.map((item, index) => (
          <button
            key={index}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            title={item.label}
          >
            <item.icon className="w-6 h-6 text-gray-600" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
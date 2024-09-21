import React from 'react';
import { FaHome, FaInfoCircle, FaPaw, FaPhone, FaList } from 'react-icons/fa';

const Sidebar = ({ activeSection, setActiveSection, formStatus }) => {
  const getIconBgColor = (status) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'pending') return 'bg-yellow-700';
    return 'bg-yellow-700';
  };

  return (
   <aside className="flex flex-col space-y-2 bg-gray-200 p-4 w-1/12 items-center">
  <div
    className={`p-4 ${activeSection === 'globalSections' ? 'bg-yellow-100 rounded-md' : 'rounded-full bg-gray-500'} transition-all duration-300`}
    onClick={() => setActiveSection('globalSections')}
  >
    <FaList size={20} className={`${activeSection === 'globalSections' ? 'text-yellow-700' : 'text-white'}`} />
  </div>
  <h1 className="text-sm text-center">Global Sections</h1>

  <div
    className={`p-4 ${activeSection === 'homePage' ? 'bg-yellow-100 rounded-md' : 'rounded-full bg-gray-500'} transition-all duration-300`}
    onClick={() => setActiveSection('homePage')}
  >
    <FaHome size={20} className={`${activeSection === 'homePage' ? 'text-yellow-700' : 'text-white'}`} />
  </div>
  <h1 className="text-sm text-center">Home Page</h1>

  <div
    className={`p-4 ${activeSection === 'aboutUs' ? 'bg-yellow-100 rounded-md' : 'rounded-full bg-gray-500'} transition-all duration-300`}
    onClick={() => setActiveSection('aboutUs')}
  >
    <FaInfoCircle size={20} className={`${activeSection === 'aboutUs' ? 'text-yellow-700' : 'text-white'}`} />
  </div>
  <h1 className="text-sm text-center">About Us</h1>

  <div
    className={`p-4 ${activeSection === 'services' ? 'bg-yellow-100 rounded-md' : 'rounded-full bg-gray-500'} transition-all duration-300`}
    onClick={() => setActiveSection('services')}
  >
    <FaPaw size={20} className={`${activeSection === 'services' ? 'text-yellow-700' : 'text-white'}`} />
  </div>
  <h1 className="text-sm text-center">Services</h1>

  <div
    className={`p-4 ${activeSection === 'contactUs' ? 'bg-yellow-100 rounded-md' : 'rounded-full bg-gray-500'} transition-all duration-300`}
    onClick={() => setActiveSection('contactUs')}
  >
    <FaPhone size={20} className={`${activeSection === 'contactUs' ? 'text-yellow-700' : 'text-white'}`} />
  </div>
  <h1 className="text-sm text-center">Contact Us</h1>
</aside>

  );
};

export default Sidebar;

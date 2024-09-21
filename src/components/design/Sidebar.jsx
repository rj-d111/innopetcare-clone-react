import React from 'react';
import { FaHome, FaInfoCircle, FaPaw, FaPhone, FaList } from 'react-icons/fa';

const Sidebar = ({ activeSection, setActiveSection, formStatus }) => {
  const getIconBgColor = (status) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'pending') return 'bg-white';
    return 'bg-brown';
  };

  return (
    <aside className="bg-gray-200 h-screen p-4 w-2/12">
      <div className={`p-4 ${getIconBgColor(formStatus.globalSections)} rounded-full`}>
        <FaList onClick={() => setActiveSection('globalSections')} size={24} />
      </div>
      <div className={`p-4 ${getIconBgColor(formStatus.homePage)} rounded-full`}>
        <FaHome onClick={() => setActiveSection('homePage')} size={24} />
      </div>
      <div className={`p-4 ${getIconBgColor(formStatus.aboutUs)} rounded-full`}>
        <FaInfoCircle onClick={() => setActiveSection('aboutUs')} size={24} />
      </div>
      <div className={`p-4 ${getIconBgColor(formStatus.services)} rounded-full`}>
        <FaPaw onClick={() => setActiveSection('services')} size={24} />
      </div>
      <div className={`p-4 ${getIconBgColor(formStatus.contactUs)} rounded-full`}>
        <FaPhone onClick={() => setActiveSection('contactUs')} size={24} />
      </div>
    </aside>
  );
};

export default Sidebar;

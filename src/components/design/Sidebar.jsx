import React from 'react';
import { BiSolidDonateHeart } from 'react-icons/bi';
import { FaHome, FaInfoCircle, FaPaw, FaList, FaHandsHelping } from 'react-icons/fa';
import { FaPhone } from "react-icons/fa6";
import { MdPets } from 'react-icons/md';
import { RiDiscussFill } from 'react-icons/ri';

const Sidebar = ({ activeSection, setActiveSection, formStatus, projectType }) => {
  const getIconBgColor = (status) => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'pending') return 'bg-yellow-700';
    return 'bg-yellow-700';
  };

  return (
    <aside className="flex flex-col space-y-2 bg-gray-200 p-4 md:w-1/12 w-1/3 items-center">
      <div
        className={`p-4 ${activeSection === 'globalSections' ? 'bg-yellow-100 rounded-full' : 'rounded-full bg-gray-500'} transition-all duration-300`}
        onClick={() => setActiveSection('globalSections')}
      >
        <FaList size={20} className={`${activeSection === 'globalSections' ? 'text-yellow-700' : 'text-white'}`} />
      </div>
      <h1 className="text-sm text-center">Global Sections</h1>

      <div
        className={`p-4 ${activeSection === 'homePage' ? 'bg-yellow-100 rounded-full' : 'rounded-full bg-gray-500'} transition-all duration-300`}
        onClick={() => setActiveSection('homePage')}
      >
        <FaHome size={20} className={`${activeSection === 'homePage' ? 'text-yellow-700' : 'text-white'}`} />
      </div>
      <h1 className="text-sm text-center">Home Page</h1>

      <div
        className={`p-4 ${activeSection === 'aboutUs' ? 'bg-yellow-100 rounded-full' : 'rounded-full bg-gray-500'} transition-all duration-300`}
        onClick={() => setActiveSection('aboutUs')}
      >
        <FaInfoCircle size={20} className={`${activeSection === 'aboutUs' ? 'text-yellow-700' : 'text-white'}`} />
      </div>
      <h1 className="text-sm text-center">About Us</h1>

      {projectType !== 'Animal Shelter Site' && (
        <>
      <div
        className={`p-4 ${activeSection === 'services' ? 'bg-yellow-100 rounded-full' : 'rounded-full bg-gray-500'} transition-all duration-300`}
        onClick={() => setActiveSection('services')}
        >
        <FaPaw size={20} className={`${activeSection === 'services' ? 'text-yellow-700' : 'text-white'}`} />
      </div>
      <h1 className="text-sm text-center">Services</h1>
        </>
      )}
      <div
        className={`p-4 ${activeSection === 'contactUs' ? 'bg-yellow-100 rounded-full' : 'rounded-full bg-gray-500'} transition-all duration-300`}
        onClick={() => setActiveSection('contactUs')}
      >
        <FaPhone size={20} className={`${activeSection === 'contactUs' ? 'text-yellow-700' : 'text-white'}`} />
      </div>
      <h1 className="text-sm text-center">Contact Us</h1>

      <div
        className={`p-4 ${activeSection === 'adoptPets' ? 'bg-yellow-100 rounded-full' : 'rounded-full bg-gray-500'} transition-all duration-300`}
        onClick={() => setActiveSection('adoptPets')}
      >
        <MdPets size={20} className={`${activeSection === 'adoptPets' ? 'text-yellow-700' : 'text-white'}`} />
      </div>
      <h1 className="text-sm text-center">Adopt Pets</h1>

      {/* Conditionally render Donate and Volunteer sections for Animal Shelter Site */}
      {projectType === 'Animal Shelter Site' && (
        <>
          <div
            className={`p-4 ${activeSection === 'donate' ? 'bg-yellow-100 rounded-full' : 'rounded-full bg-gray-500'} transition-all duration-300`}
            onClick={() => setActiveSection('donate')}
          >
            
            <BiSolidDonateHeart size={20} className={`${activeSection === 'donate' ? 'text-yellow-700' : 'text-white'}`} />
          </div>
          <h1 className="text-sm text-center">Donate</h1>

          <div
            className={`p-4 ${activeSection === 'volunteer' ? 'bg-yellow-100 rounded-full' : 'rounded-full bg-gray-500'} transition-all duration-300`}
            onClick={() => setActiveSection('volunteer')}
          >
            <FaHandsHelping size={20} className={`${activeSection === 'volunteer' ? 'text-yellow-700' : 'text-white'}`} />
          </div>
          <h1 className="text-sm text-center">Volunteer</h1>
        </>
      )}
    </aside>
  );
};

export default Sidebar;

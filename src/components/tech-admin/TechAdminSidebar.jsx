import React from 'react';
import { FaRegFolderOpen, FaUserAlt } from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';
import { RiAdminFill } from "react-icons/ri";

export default function TechAdminSidebar({ activeSection, setActiveSection }) {
  return (
    <div className="w-1/3 bg-yellow-900 text-white h-[calc(100vh-64px)] p-4 flex flex-col"> {/* Adjust 64px to match your header height */}
      <RiAdminFill size={80} className='mx-auto mb-4' />
      <h2 className="text-lg font-bold text-center">Tech Admin Menu</h2>
      <ul className="mt-4 flex-grow">
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${activeSection === "dashboard" ? "bg-yellow-950" : ""}`}
          onClick={() => setActiveSection("dashboard")}
        >
          <MdDashboard className="mr-2" /> Dashboard
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${activeSection === "users" ? "bg-yellow-950" : ""}`}
          onClick={() => setActiveSection("users")}
        >
          <FaUserAlt className="mr-2" /> Users
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${activeSection === "projects" ? "bg-yellow-950" : ""}`}
          onClick={() => setActiveSection("projects")}
        >
          <FaRegFolderOpen className="mr-2" /> Projects
        </li>
      </ul>
      <li
        className="flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-yellow-950"
        onClick={() => setActiveSection("logout")} // Change the action as needed
      >
        <MdLogout className="mr-2" /> Logout
      </li>
    </div>
  );
}

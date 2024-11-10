import React, { useEffect } from 'react';
import { FaMoneyBill, FaRegFolderOpen, FaUserAlt } from 'react-icons/fa';
import { MdDashboard, MdLogout, MdOutlineReportGmailerrorred } from 'react-icons/md';
import { RiAdminFill, RiFileAddFill } from "react-icons/ri";
import { VscFeedback } from "react-icons/vsc";
import { getAuth, signOut } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { GiCrystalGrowth } from "react-icons/gi";
import { TbReportAnalytics } from 'react-icons/tb';


export default function TechAdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out as tech admin");
      navigate("/"); // Redirect to guest home after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Helper function to determine if a section is active based on the URL
  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="hidden lg:w-1/3 bg-yellow-900 text-white h-[calc(100vh-64px)] p-4 lg:flex lg:flex-col">
      <RiAdminFill size={80} className='mx-auto mb-4' />
      <h2 className="text-lg font-bold text-center">Tech Admin Menu</h2>
      <ul className="mt-4 flex-grow">
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
            isActive("/admin/dashboard") ? "bg-yellow-950" : ""
          }`}
          onClick={() => navigate("/admin/dashboard")}
        >
          <MdDashboard className="mr-2" /> Dashboard
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
            isActive("/admin/users") ? "bg-yellow-950" : ""
          }`}
          onClick={() => navigate("/admin/users")}
        >
          <FaUserAlt className="mr-2" /> Users
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
            isActive("/admin/projects") ? "bg-yellow-950" : ""
          }`}
          onClick={() => navigate("/admin/projects")}
        >
          <FaRegFolderOpen className="mr-2" /> Projects
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
            isActive("/admin/additional") ? "bg-yellow-950" : ""
          }`}
          onClick={() => navigate("/admin/additional")}
        >
          <RiFileAddFill className="mr-2" /> Additional Pending Projects
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
            isActive("/admin/feedback") ? "bg-yellow-950" : ""
          }`}
          onClick={() => navigate("/admin/feedback")}
        >
          <VscFeedback className="mr-2" /> User Feedback
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
            isActive("/admin/send-report") ? "bg-yellow-950" : ""
          }`}
          onClick={() => navigate("/admin/send-report")}
        >
          <MdOutlineReportGmailerrorred className="mr-2" /> Send Report
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
            isActive("/admin/report") ? "bg-yellow-950" : ""
          }`}
          onClick={() => navigate("/admin/report")}
        >
          <TbReportAnalytics className="mr-2" /> Report Generation
        </li>
        <li
          className={`flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
            isActive("/admin/finance") ? "bg-yellow-950" : ""
          }`}
          onClick={() => navigate("/admin/finance")}
        >
          <FaMoneyBill className="mr-2" /> Financial Reports
        </li>
      </ul>
      <li
        className="flex items-center cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-yellow-950"
        onClick={handleLogout}
      >
        <MdLogout className="mr-2" /> Logout
      </li>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  MdDashboard,
  MdLogout,
  MdOutlineReportGmailerrorred,
} from "react-icons/md";
import { FaUserAlt, FaRegFolderOpen, FaMoneyBill } from "react-icons/fa";
import { RiFileAddFill } from "react-icons/ri";
import { VscFeedback } from "react-icons/vsc";
import { toast } from "react-toastify";
import { TbReportAnalytics } from "react-icons/tb";

export default function HeaderTechAdmin() {
  const [pageState, setPageState] = useState("Sign in");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  // Update the active section based on URL
  useEffect(() => {
    if (location.pathname.includes("/admin/dashboard")) {
      setActiveSection("dashboard");
    } else if (location.pathname.includes("/admin/users")) {
      setActiveSection("users");
    } else if (location.pathname.includes("/admin/projects")) {
      setActiveSection("projects");
    } else if (location.pathname.includes("/admin/additional")) {
      setActiveSection("additional");
    } else if (location.pathname.includes("/admin/feedback")) {
      setActiveSection("feedback");
    }
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setPageState(user ? "Profile" : "Sign in");
    });
    return () => unsubscribe();
  }, [auth]);

  function handleLogout() {
    auth.signOut().then(() => navigate("/"));
    toast.success("Successfully logged out as tech admin");
  }

  // Function to close menu, set active section, and navigate
  function handleSectionChange(section) {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
    switch (section) {
      case "dashboard":
        navigate("/admin/dashboard");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "projects":
        navigate("/admin/projects");
        break;
      case "additional":
        navigate("/admin/additional");
        break;
      case "feedback":
        navigate("/admin/feedback");
        break;
      case "send-report":
        navigate("/admin/send-report");
        break;
      case "report":
        navigate("/admin/report");
        break;
      case "finance":
        navigate("/admin/finance");
        break;
      default:
        navigate("/admin/dashboard");
    }
  }

  return (
    <header className="flex justify-between items-center p-4 bg-yellow-900 shadow-sm sticky top-0 z-40">
      <img
        onClick={() => navigate("/")}
        src="/images/innopetcare-white.png"
        alt="Innopetcare logo"
        className="h-8 cursor-pointer"
      />

      {/* Mobile Menu Toggle Button */}
      <button
        className="lg:hidden text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        ☰ {/* Hamburger icon */}
      </button>

      {/* Sliding Mobile Menu (appears from the right) */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-yellow-900 text-white p-6 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button */}
        <button
          className="text-2xl font-bold self-end mb-6"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          &times;
        </button>

        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* Scrollable section */}
          <div className="overflow-y-auto space-y-4">
            <ul>
              <li
                className={`flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
                  activeSection === "dashboard" ? "bg-yellow-950" : ""
                }`}
                onClick={() => handleSectionChange("dashboard")}
              >
                <MdDashboard className="mr-2" /> Dashboard
              </li>
              <li
                className={`flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
                  activeSection === "users" ? "bg-yellow-950" : ""
                }`}
                onClick={() => handleSectionChange("users")}
              >
                <FaUserAlt className="mr-2" /> Users
              </li>
              <li
                className={`flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
                  activeSection === "projects" ? "bg-yellow-950" : ""
                }`}
                onClick={() => handleSectionChange("projects")}
              >
                <FaRegFolderOpen className="mr-2" /> Projects
              </li>
              <li
                className={`flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
                  activeSection === "additional" ? "bg-yellow-950" : ""
                }`}
                onClick={() => handleSectionChange("additional")}
              >
                <RiFileAddFill className="mr-2" /> Additional Pending Projects
              </li>
              <li
                className={`flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
                  activeSection === "feedback" ? "bg-yellow-950" : ""
                }`}
                onClick={() => handleSectionChange("feedback")}
              >
                <VscFeedback className="mr-2" /> User Feedback
              </li>
              <li
                className={`flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
                  activeSection === "send-report" ? "bg-yellow-950" : ""
                }`}
                onClick={() => handleSectionChange("send-report")}
              >
                <MdOutlineReportGmailerrorred className="mr-2" /> Send Report
              </li>
              <li
                className={`flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
                  activeSection === "report" ? "bg-yellow-950" : ""
                }`}
                onClick={() => handleSectionChange("report")}
              >
                <TbReportAnalytics className="mr-2" /> Report Generation
              </li>
              <li
                className={`flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 ${
                  activeSection === "finance" ? "bg-yellow-950" : ""
                }`}
                onClick={() => handleSectionChange("finance")}
              >
                <FaMoneyBill className="mr-2" /> Financial Reports
              </li>
            </ul>
          </div>

          {/* Fixed Logout Button */}
          <div className="mt-auto">
            <ul>
              <li
                className="flex items-center cursor-pointer p-4 rounded-lg transition-colors duration-200 hover:bg-yellow-950"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <MdLogout className="mr-2" /> Logout
              </li>
            </ul>
            <div className="mb-4"></div>
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from "react";
import TechAdminSidebar from "../components/tech-admin/TechAdminSidebar";
import { Outlet, useNavigate } from "react-router-dom";

export default function TechAdminHome() {
  const [activeSection, setActiveSection] = useState("dashboard"); // Default section
  const navigate = useNavigate();

  // This function can be used to handle sidebar clicks and navigate accordingly
  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Use navigate to go to the corresponding route when a sidebar item is clicked
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
      case "feedback":
        navigate("/admin/feedback");
        break;
      case "logout":
        // Handle logout logic here (e.g., clear session, redirect to login page)
        navigate("/login");
        break;
      default:
        navigate("/admin/dashboard"); // Default to dashboard
    }
  };

  return (
    <div className="flex">
      {/* Sidebar that passes activeSection and a function to change the section */}
      <TechAdminSidebar
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
      />
      
      {/* Content area where the nested routes (dashboard, users, etc.) will render */}
      <div className="w-full flex-grow">
        {/* Outlet renders the nested route content */}
        <Outlet />
      </div>
    </div>
  );
}

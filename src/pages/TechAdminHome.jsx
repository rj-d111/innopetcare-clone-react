import React, { useState } from "react";
import TechAdminSidebar from "../components/tech-admin/TechAdminSidebar";
import TechAdminDashboard from "../components/tech-admin/TechAdminDashboard";
import TechAdminProjects from "../components/tech-admin/TechAdminProjects";
import TechAdminUsers from "../components/tech-admin/TechAdminUsers";

export default function TechAdminHome() {
  const [activeSection, setActiveSection] = useState("dashboard"); // Default section
  const [formData, setFormData] = useState({});
  const [formDataHome, setFormDataHome] = useState({});
  const [formStatus, setFormStatus] = useState("");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <TechAdminDashboard formData={formData} setFormData={setFormData} />
        );
      case "users":
        return <TechAdminUsers />;
      case "projects":
        return (
          <TechAdminProjects
            formData={formDataHome}
            setFormData={setFormDataHome}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex">
        <TechAdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          formStatus={formStatus}
        />
        <div className="w-full flex-grow">
          <div className="flex">
            <div className="w-full">{renderSection()}</div>
          </div>
        </div>
      </div>
    </>
  );
}

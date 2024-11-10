import React from "react";
import TechAdminSidebar from "../components/tech-admin/TechAdminSidebar";
import { Outlet } from "react-router-dom";

export default function TechAdminHome() {
  return (
    <div className="flex">
      {/* Sidebar without activeSection and setActiveSection props */}
      <TechAdminSidebar />
      
      {/* Content area where the nested routes (dashboard, users, etc.) will render */}
      <div className="w-full h-[calc(100vh-64px)] overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

import React, { useState } from "react";
import HeaderDesign from "../components/HeaderDesign";
import Sidebar from "../components/design/Sidebar";
import GlobalSections from "../components/design/GlobalSections";
import HomePage from "../components/design/HomePage";
import AboutUs from "../components/design/AboutUs";
import Services from "../components/design/Services";
import ContactUs from "../components/design/ContactUs";
import CanvasWeb from "../components/design/CanvasWeb";
import CanvasMobile from "../components/design/CanvasMobile";

function Design() {
  const [isWebVersion, setWebVersion] = useState(true);
  const [activeSection, setActiveSection] = useState("globalSections");
  const [formStatus, setFormStatus] = useState({
    globalSections: "pending",
    homePage: "pending",
    aboutUs: "pending",
    services: "pending",
    contactUs: "pending",
  });

  const renderSection = () => {
    switch (activeSection) {
      case "globalSections":
        return <GlobalSections />;
      case "homePage":
        return <HomePage />;
      case "aboutUs":
        return <AboutUs />;
      case "services":
        return <Services />;
      case "contactUs":
        return <ContactUs />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        formStatus={formStatus}
      />
      <div className="w-10/12">
        <div className="flex">
          <div className="w-1/3">{renderSection()}</div>
          <div className="w-2/3">
            {isWebVersion ? <CanvasWeb /> : <CanvasMobile />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Design;
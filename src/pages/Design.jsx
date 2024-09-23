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
import { useParams } from "react-router";


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
    <div className="flex overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        formStatus={formStatus}
      />
      <div className="w-full">
        <div className="flex">
          <div className="md:w-1/2 md:shadow-right-md max-h-screen overflow-auto">
            {renderSection()}
          </div>
          <div className="hidden md:block md:w-full mx-10 mt-10 overflow-hidden">
            {isWebVersion ? <CanvasWeb /> : <CanvasMobile />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Design;

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

function Design({ isWebVersion, setWebVersion }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    headerColor: "",
    headerTextColor: "",
    image: null,
  });

  const [formDataHome, setFormDataHome] = useState({
    title: "",
    subtext: "",
    content: "",
    picture: null,
  });


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
        return <GlobalSections formData={formData} setFormData={setFormData} />;
      case "homePage":
        return <HomePage formData={formDataHome} setFormData={setFormDataHome}/>;
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
    <div className="flex">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        formStatus={formStatus}
      />
      <div className="w-full">
        <div className="flex">
          <div className="md:w-1/2 md:shadow-right-md">{renderSection()}</div>
          <div className="hidden md:flex md:flex-grow md:justify-center md:w-full mx-10 mt-10 overflow-hidden">
          {isWebVersion ? (
              <CanvasWeb formData={formData} />
            ) : (
              <CanvasMobile />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Design;

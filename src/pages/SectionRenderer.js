// SectionRenderer.js
import React from "react";
import GlobalSections from "../components/design/GlobalSections";
import HomePage from "../components/design/HomePage";
import AboutUs from "../components/design/AboutUs";
import Services from "../components/design/Services";
import ContactUs from "../components/design/ContactUs";
import Forum from "../components/design/Forum";
import AdoptPet from "../components/design/AdoptPet";
import Volunteer from "../components/design/Volunteer";
import Donate from "../components/design/Donate";

const SectionRenderer = ({
  activeSection,
  formData,
  setFormData,
  formDataHome,
  setFormDataHome,
  setImagePreview,
}) => {
  switch (activeSection) {
    case "globalSections":
      return <GlobalSections formData={formData} setFormData={setFormData} setImagePreview={setImagePreview} />;
    case "homePage":
      return <HomePage formData={formDataHome} setFormData={setFormDataHome} />;
    case "aboutUs":
      return <AboutUs />;
    case "services":
      return <Services />;
    case "contactUs":
      return <ContactUs />;
    case "adoptPets":
      return <AdoptPet />;
    case "donate":
      return <Donate />;
    case "volunteer":
      return <Volunteer />;
    default:
      return null;
  }
};

export default SectionRenderer;

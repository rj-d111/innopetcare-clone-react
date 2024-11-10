import React, { useState, useEffect } from "react";
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
import Forum from "../components/design/Forum";
import AdoptPet from "../components/design/AdoptPet";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Volunteer from "../components/design/Volunteer";
import Donate from "../components/design/Donate";
import UserFeedbackSection from "../components/design/UserFeedbackSection";
import SendReportSection from "../components/design/SendReportSection";
import PetHealthRecordsSection from "../components/design/PetHealthRecordsSection";
import DonateSection from "../components/design/DonateSection";

function Design({ isWebVersion, setWebVersion }) {
  const { id } = useParams();
  const [projectType, setProjectType] = useState("");

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

  const [imagePreview, setImagePreview] = useState(null);
  const [activeSection, setActiveSection] = useState("globalSections");
  const [formStatus, setFormStatus] = useState({
    globalSections: "pending",
    homePage: "pending",
    aboutUs: "pending",
    services: "pending",
    contactUs: "pending",
    adoptPets: "pending",
    donate: "pending",
    volunteer: "pending",
  });

  useEffect(() => {
    const fetchProjectById = async (projectId) => {
      try {
        const projectRef = doc(db, "projects", projectId); // Create a reference to the project document
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          return projectSnap.data(); // Return the project data
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    const fetchProjectData = async () => {
      const projectData = await fetchProjectById(id); // Fetch project data using project ID
      if (projectData) {
        setProjectType(projectData.type); // Set the project type
      }
    };

    fetchProjectData();
  }, [id]);

  const renderSection = () => {
    switch (activeSection) {
      case "globalSections":
        return (
          <GlobalSections
            formData={formData}
            setFormData={setFormData}
            setImagePreview={setImagePreview}
          />
        );
      case "homePage":
        return (
          <HomePage formData={formDataHome} setFormData={setFormDataHome} />
        );
      case "aboutUs":
        return <AboutUs />;
      case "services":
        return <Services />;
      case "petHealthRecords":
        return <PetHealthRecordsSection />;
      case "contactUs":
        return <ContactUs />;
      case "adoptPets":
        return <AdoptPet />;
      case "donate":
        return <Donate />;
      case "donate-section":
        return <DonateSection />;
      case "volunteer":
        return <Volunteer />;
      case "userFeedback":
        return <UserFeedbackSection />;
      case "sendReport":
        return <SendReportSection />;
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
        projectType={projectType} // Pass project type to Sidebar
      />
      <div className="w-full">
        <div className="flex">
          <div className="md:w-1/3 md:shadow-right-md h-[calc(100vh-80px)] overflow-auto">
            {renderSection()}
          </div>
          <div className="hidden md:flex md:flex-grow md:justify-center md:2/3 mx-10 py-10 h-[calc(100vh-80px)] overflow-auto">
            {isWebVersion ? (
              <CanvasWeb formData={formData} imagePreview={imagePreview} />
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

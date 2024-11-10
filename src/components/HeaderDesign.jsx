import React, { useState, useEffect } from "react";
import innoPetCareSmallLogo from "../assets/png/InnoPetCareSmall.png";
import { IoDesktop, IoPhonePortrait } from "react-icons/io5";
import { MdPublish } from "react-icons/md";
import { useNavigate, Link } from "react-router-dom"; 
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore"; 
import { db } from "../firebase"; 
import ModalRename from "./ModalRename"; 
import { toast } from "react-toastify";

const HeaderDesign = ({
  isWebVersion,
  setWebVersion,
  projects,
  onProjectRename,
}) => {
  const [projectName, setProjectName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [project, setProject] = useState(null);

  const url = window.location.href;
  const parts = url.split("/");
  const uuid = parts[parts.length - 1];
  const navigate = useNavigate();

  const handlePublish = async () => {
    if (!uuid) {
      toast.error("Project ID is missing.");
      return;
    }
  
    try {
      const checkDocumentExists = async (collectionName, errorMessage) => {
        const docRef = doc(db, collectionName, uuid);
        const docSnapshot = await getDoc(docRef);
        if (!docSnapshot.exists()) {
          toast.error(errorMessage);
          return false;
        }
        return true;
      };

      // Check if data exists in global-sections table
      const globalSectionsQuery = query(
        collection(db, "global-sections"),
        where("projectId", "==", uuid)
      );
      
      const globalSectionsSnapshot = await getDocs(globalSectionsQuery);
      if (globalSectionsSnapshot.empty) {
        toast.error("Please add data to Global Sections.");
        return;
      }
  
      // Check if data exists in home-sections table
        const homeSectionsQuery = query(
          collection(db, "home-sections", uuid, "sections")
        );
        const querySnapshot = await getDocs(homeSectionsQuery);
        if (querySnapshot.empty) {
          toast.error("Please add a section in Home Sections.");
          return;
        }
  
       

    
      // Check if data exists in contact-info table
      const contactInfoQuery = query(
        collection(db, "contact-info"),
        where("projectId", "==", uuid)
      );
      const contactInfoSnapshot = await getDocs(contactInfoQuery);
      if (contactInfoSnapshot.empty) {
        toast.error("Please add contact info.");
        return;
      }
  
      // Check if at least one service exists in services table if not animal shelter site
      if (project && project.type !== "Animal Shelter Site") {
        const servicesQuery = query(
          collection(db, "services"),
          where("projectId", "==", uuid)
        );
        const servicesSnapshot = await getDocs(servicesQuery);
        if (servicesSnapshot.empty) {
          toast.error("Please add at least one service.");
          return;
        }
      }  

      // Check if the project type is "Animal Shelter Site"
      if (project && project.type === "Animal Shelter Site") {
        const volunteerExists = await checkDocumentExists(
          "volunteer",
          "Please add a section in Volunteer Section."
        );
        if (!volunteerExists) return;

        const donationsExists = await checkDocumentExists(
          "donations",
          "Please add a donation site in Donations Section."
        );
        if (!donationsExists) return;
      }

      
      const aboutSectionRef = doc(db, "about-sections", uuid); // using uuid as projectId
      const aboutSectionSnapshot = await getDoc(aboutSectionRef);
      if (aboutSectionSnapshot.empty) {
        toast.error("Please fill all fields in About Section."
        );
        return;
      }


      // If all validations pass, show success message and redirect
      toast.success("Successfully deployed your website!");
      
      // Update the project status to "active"
      const projectDocRef = doc(db, "projects", uuid);
      await updateDoc(projectDocRef, { status: "active" });
      
      navigate("/sites");
    } catch (error) {
      console.error("Error validating data:", error);
      toast.error("An error occurred during the publishing process.");
    }
  };

  // Fetch the project based on the UUID
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectDoc = doc(db, "projects", uuid);
        const projectSnapshot = await getDoc(projectDoc);
        if (projectSnapshot.exists()) {
          const projectData = projectSnapshot.data();
          setProjectName(projectData.name);
          setProject(projectData);
        } else {
          toast.error("Project not found");
        }
      } catch (error) {
        toast.error("Error fetching project data");
      }
    };

    if (uuid) {
      fetchProject();
    }
  }, [uuid]);

  // Handle opening the rename modal
  const handleEditClick = () => {
    setShowRenameModal(true);
  };

  return (
    <header className="flex justify-between items-center p-1 md:p-4 bg-yellow-500 shadow-sm sticky top-0 z-40">
      <div className="flex items-center space-x-6">
        <Link to="/">
          <img src={innoPetCareSmallLogo} alt="Logo" className="h-8 md:h-12" />
        </Link>
        <div className="flex items-center space-x-2">
          <h1 className="text-xs md:text-xl font-bold text-white">{projectName}</h1>
          {/* <MdModeEdit
            className="cursor-pointer text-white"
            onClick={handleEditClick}
            size={24}
          /> */}
        </div>
      </div>

      <div className="join">
        <button
          className={`btn join-item hover:border-white hover:bg-yellow-500 border-yellow-500 ${
            !isWebVersion ? "bg-white" : "bg-yellow-600"
          }`}
        >
          <IoDesktop
            onClick={() => setWebVersion(true)}
            className={`cursor-pointer text-[18px] md:text-[24px] ${
              isWebVersion ? "text-white" : "text-yellow-600"
            }`}
          />
        </button>
        <button
          className={`btn join-item hover:border-white hover:bg-yellow-500 border-yellow-500 ${
            isWebVersion ? "bg-white" : "bg-yellow-600"
          }`}
        >
          <IoPhonePortrait
            onClick={() => setWebVersion(false)}
            className={`cursor-pointer text-[18px] md:text-[24px] ${
              !isWebVersion ? "text-white" : "text-yellow-600"
            }`}
          />
        </button>
      </div>

      {/* Show publish button only if status is "pending" */}
      {project?.status === "pending" ? (
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            onClick={handlePublish}
            className="bg-white hover:bg-yellow-100 text-yellow-800 px-3 py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-200 shadow-md hover:shadow-lg active:shadow-lg flex items-center space-x-2"
          >
            <MdPublish className="md:text-lg" />
            <span className="hidden md:block">Publish Website</span>
          </button>
        </div>
      ): <div></div>}

      {/* Rename modal */}
      <ModalRename
        show={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        project={project} // Pass the current project
        projects={projects}
        onProjectRename={onProjectRename} // Pass the rename handler
      />
    </header>
  );
};

export default HeaderDesign;

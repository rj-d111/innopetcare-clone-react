import React, { useState, useEffect } from "react";
import innoPetCareSmallLogo from "../assets/png/InnoPetCareSmall.png";
import { IoDesktop, IoPhonePortrait } from "react-icons/io5";
import { MdModeEdit, MdPublish } from "react-icons/md";
import { useParams, useNavigate, Link } from "react-router-dom"; // Import useNavigate for redirection
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore"; // Firestore functions
import { db } from "../firebase"; // Firebase config
import ModalRename from "./ModalRename"; // Import ModalRename component
import { toast } from "react-toastify";

const HeaderDesign = ({
  isWebVersion,
  setWebVersion,
  projects,
  onProjectRename,
}) => {
  const [projectName, setProjectName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false); // Modal visibility state
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
      // Check if data exists in global-sections table
      const globalSectionsQuery = query(
        collection(db, "global-sections"),
        where("projectId", "==", uuid) // Use uuid instead of id
      );
      const globalSectionsSnapshot = await getDocs(globalSectionsQuery);
      if (globalSectionsSnapshot.empty) {
        toast.error("Please add data to Global Sections.");
        return;
      }

      // Check if data exists in home-sections table
      const homeSectionsQuery = query(
        collection(db, "home-sections"),
        where("projectId", "==", uuid) // Use uuid instead of id
      );
      const homeSectionsSnapshot = await getDocs(homeSectionsQuery);
      if (homeSectionsSnapshot.empty) {
        toast.error("Please add data to Home Sections.");
        return;
      }

      // Check if data exists in contact-info table
      const contactInfoQuery = query(
        collection(db, "contact-info"),
        where("projectId", "==", uuid) // Use uuid instead of id
      );
      const contactInfoSnapshot = await getDocs(contactInfoQuery);
      if (contactInfoSnapshot.empty) {
        toast.error("Please add contact info.");
        return;
      }

      // Check if at least one service exists in services table
      const servicesQuery = query(
        collection(db, "services"),
        where("projectId", "==", uuid) // Use uuid instead of id
      );
      const servicesSnapshot = await getDocs(servicesQuery);
      if (servicesSnapshot.empty) {
        toast.error("Please add at least one service.");
        return;
      }

      // If all validations pass, show success message and redirect
      toast.success("Successfully deployed your website!");
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
          setProjectName(projectData.name); // Set project name
          setProject(projectData); // Set the project data
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
    <header className="flex justify-between items-center p-4 bg-yellow-500 shadow-sm sticky top-0 z-40">
      <div className="flex items-center  space-x-6">
        <Link to="/">
          <img src={innoPetCareSmallLogo} alt="Logo" className="h-12" />
        </Link>
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-white">{projectName}</h1>
          <MdModeEdit
            className="cursor-pointer text-white"
            onClick={handleEditClick} // Show rename modal on click
            size={24}
          />
        </div>
      </div>

      <div class="join ">
        <button
          class={`btn join-item hover:border-white hover:bg-yellow-500 border-yellow-500 ${
            !isWebVersion ? "bg-white" : "bg-yellow-600"
          }`}
        >
          <IoDesktop
            onClick={() => setWebVersion(true)}
            className={`cursor-pointer ${
              isWebVersion ? "text-white" : "text-yellow-600"
            }`}
            size={24}
          />
        </button>
        <button
          class={`btn join-item hover:border-white hover:bg-yellow-500 border-yellow-500 ${
            isWebVersion ? "bg-white" : "bg-yellow-600"
          }`}
        >
          <IoPhonePortrait
            onClick={() => setWebVersion(false)}
            className={`cursor-pointer ${
              !isWebVersion ? "text-white" : "text-yellow-600"
            }`}
            size={24}
          />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="submit"
          onClick={handlePublish}
          className="bg-white hover:bg-yellow-100 text-yellow-800 px-3 py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-200 shadow-md hover:shadow-lg active:shadow-lg flex items-center space-x-2"
        >
          <MdPublish className="text-lg" />
          <span>Publish Website</span>
        </button>
      </div>

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

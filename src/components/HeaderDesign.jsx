import React, { useState, useEffect } from "react";
import innoPetCareSmallLogo from "../assets/png/InnoPetCareSmall.png";
import { IoDesktop, IoPhonePortrait } from "react-icons/io5";
import { MdModeEdit, MdPublish } from "react-icons/md";
import { useParams } from "react-router-dom"; // Import useParams to get URL parameters
import { doc, getDoc } from "firebase/firestore"; // Firestore functions
import { db } from "../firebase"; // Firebase config
import ModalRename from "./ModalRename"; // Import ModalRename component
import { toast } from "react-toastify";

const HeaderDesign = ({
  isWebVersion,
  setWebVersion,
  projects,
  onProjectRename,
}) => {
  const { uuid } = useParams(); // Extract UUID from the URL
  const [projectName, setProjectName] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false); // Modal visibility state
  const [project, setProject] = useState(null);

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
      <img src={innoPetCareSmallLogo} alt="Logo" className="h-12" />

      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">{projectName}</h1>
        <MdModeEdit
          className="cursor-pointer"
          onClick={handleEditClick} // Show rename modal on click
          size={24}
        />
      </div>

      <div className="flex items-center space-x-4">
        <IoDesktop
          onClick={() => setWebVersion(true)}
          className={`cursor-pointer ${
            isWebVersion ? "text-white" : "text-slate-900"
          }`}
          size={24}
        />
        <IoPhonePortrait
          onClick={() => setWebVersion(false)}
          className={`cursor-pointer ${
            !isWebVersion ? "text-white" : "text-slate-900"
          }`}
          size={24}
        />
        <button
          type="submit"
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

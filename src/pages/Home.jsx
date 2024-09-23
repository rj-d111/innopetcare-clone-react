import React, { useState, useEffect } from "react";
import { FaPlus, FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { MdViewList, MdViewModule } from "react-icons/md";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase"; // Import Firebase
import Modal from "../components/Modal";
import ModalTrash from "../components/ModalTrash";
import { toast } from "react-toastify";
import ModalRename from "../components/ModalRename";
import { Navigate } from "react-router";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [userData, setUserData] = useState({ name: "" });
  const [isLoading, setIsLoading] = useState(true); // isLoading state
  const [viewMode, setViewMode] = useState("grid"); // Grid or List view
  const [selectedProjects, setSelectedProjects] = useState([]); // For bulk selection
  const [showTrashModal, setShowTrashModal] = useState(false); // Show trash confirmation modal
  const [menuOpen, setMenuOpen] = useState(null); // Track which project dropdown is open
  const [showRenameModal, setShowRenameModal] = useState(false); // For rename modal
  const [projectToRename, setProjectToRename] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Fetch projects from Firestore
  const fetchProjects = async (userId) => {
    const projectsQuery = query(
      collection(db, "projects"),
      where("userId", "==", userId)
    );
    const projectsCollection = await getDocs(projectsQuery);
    const projectList = projectsCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProjects(projectList);
  };

  // Use the hook inside your component
  const navigate = useNavigate();

  // Fetch projects from Firestore and other existing code...
  const handleProjectClick = (project) => {
    navigate(`/design/${project.id}`); // Use the unique identifier from the project
  };

  // Fetch user data and projects
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData({ name: user.displayName || "User" });
        fetchProjects(user.uid);
      }
      setIsLoading(false); // Stop loading after user data is fetched
    });

    return () => unsubscribe();
  }, []);

  // Callback when a new project is created
  const handleProjectCreate = (newProject) => {
    toast.success("Successfully created a new project");
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  // Toggle selection of projects for bulk actions
  const handleSelectProject = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter((id) => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  // Toggle between Grid and List view
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  // Handle right click to show the menu
  const handleRightClick = (e, projectId) => {
    e.preventDefault();
    setMenuOpen(menuOpen === projectId ? null : projectId);
  };

  // Handle click on three dots to show the menu
  const handleMenuClick = (projectId) => {
    setMenuOpen(menuOpen === projectId ? null : projectId);
  };

  if (isLoading) {
    return null; // Do not render anything while loading
  }
  // Handle project rename
  const handleRenameClick = (project) => {
    setProjectToRename(project);
    setShowRenameModal(true);
  };

  const handleProjectRename = (projectId, newName) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId ? { ...project, name: newName } : project
      )
    );
  };

  const handleProjectDelete = (projectId) => {
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== projectId)
    );
  };

  return (
    <>
      <section className="m-3 md:m-10">
        <h1 className="text-lg md:text-3xl font-bold my-8 text-yellow-800">
          Hello, {userData.name}
        </h1>

        <div className="flex sm:flex-row justify-between items-center sm:items-start flex-col-reverse">
          <h2 className="text-lg md:text-3xl font-bold text-slate-900 mt-4 md:mt-0">
            My Sites
          </h2>

          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <button
              onClick={toggleViewMode}
              className="bg-gray-200 p-2 rounded"
            >
              {viewMode === "grid" ? (
                <MdViewModule size={24} />
              ) : (
                <MdViewList size={24} />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-6 rounded-lg font-semibold transition duration-200 ease-in-out flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Create New Site
            </button>
          </div>
        </div>

        {/* Display project cards based on view mode */}
        <div
          className={`mt-6 ${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col space-y-4"
          }`}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
              onClick={() => handleProjectClick(project)} // Navigate on click
            >
              <div className="flex justify-between">
                <h3 className="text-lg font-bold">{project.name}</h3>
                <BsThreeDots className="text-gray-600 cursor-pointer" />
              </div>
              <p className="text-gray-600">{project.type}</p>
              <p className="text-sm text-gray-500">
                Created on:{" "}
                {new Date(project.createdAt.seconds * 1000).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ModalRename
        show={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        project={projectToRename}
        projects={projects}
        onProjectRename={handleProjectRename}
      />

      {/* Modal for creating a new project */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreate={handleProjectCreate}
      />

      {/* Trash confirmation modal */}
      <ModalTrash
        show={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        projectId={projectToDelete} // Pass the selected project to be deleted
        onDelete={handleProjectDelete} // Callback to update the UI after deletion
      />
    </>
  );
}

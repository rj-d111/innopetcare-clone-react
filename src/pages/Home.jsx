import React, { useState, useEffect } from "react";
import { FaPlus, FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { MdViewList, MdViewModule } from "react-icons/md";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import Modal from "../components/Modal";
import ModalTrash from "../components/ModalTrash";
import ModalRename from "../components/ModalRename";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [userData, setUserData] = useState({ name: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [projectToRename, setProjectToRename] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const navigate = useNavigate();

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

  const handleProjectClick = (project) => {
    navigate(`/design/${project.id}`);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData({ name: user.displayName || "User" });
        fetchProjects(user.uid);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMenuToggle = (projectId, event) => {
    event.stopPropagation(); // Prevent card click from firing
    setMenuOpen((prev) => (prev === projectId ? null : projectId)); // Toggle the clicked menu
  };

  const handleProjectCreate = (newProject) => {
    toast.success("Successfully created a new project");
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  const handleRenameClick = (project) => {
    setProjectToRename(project);
    setShowRenameModal(true);
  };

  const handleProjectRename = async (projectId, newName) => {
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, { name: newName });
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId ? { ...project, name: newName } : project
      )
    );
    toast.success("Project name updated");
  };

  const handleProjectDelete = async (projectId) => {
    const projectRef = doc(db, "projects", projectId);
    await deleteDoc(projectRef);
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== projectId)
    );
    setShowTrashModal(false);
  };

  const handleMouseEnter = (projectId) => {
    setMenuOpen(projectId);
  };

  const handleMouseLeave = () => {
    setMenuOpen(null);
  };

  if (isLoading) {
    return null;
  }

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
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
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

        <div className={`mt-6 ${viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col space-y-4"}`}>
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer relative"
              onClick={() => handleProjectClick(project)} // Card click handler
            >
              <div className="flex justify-between">
                <h3 className="text-lg font-bold">{project.name}</h3>
                <BsThreeDots
                  className="text-gray-600 cursor-pointer"
                  onClick={(e) => handleMenuToggle(project.id, e)} // Show/hide menu on click
                />
              </div>

              {menuOpen === project.id && (
                <div className="absolute bg-white shadow-lg rounded-lg right-0 z-10">
                  <button
                    className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameClick(project);
                    }}
                  >
                    <div className="flex items-center justify-between p-2">
                      <FaPencilAlt className="mr-2" /> Edit
                    </div>
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-red-600 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project.id);
                      setShowTrashModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between p-2">
                      <FaTrashAlt className="mr-2" /> Delete
                    </div>
                  </button>
                </div>
              )}

              <p className="text-gray-600">{project.type}</p>
              <p className="text-sm text-gray-500">
                Created on: {new Date(project.createdAt.seconds * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ModalRename
        show={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        project={projectToRename}
        onProjectRename={handleProjectRename}
      />

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreate={handleProjectCreate}
      />

      <ModalTrash
        show={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        projectId={projectToDelete}
        onDelete={handleProjectDelete}
      />
    </>
  );
}

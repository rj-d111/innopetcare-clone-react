import React, { useState, useEffect } from "react";
import { FaPlus, FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { MdViewList, MdViewModule } from "react-icons/md";
import { BiSolidDashboard } from "react-icons/bi";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import ModalRename from "../components/ModalRename";
import ModalTrash from "../components/ModalTrash";
import NewProjectModal from "../components/NewProjectModal";
import Footer from "../components/Footer";
import { IoFolderOpen } from "react-icons/io5";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [userData, setUserData] = useState({ name: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [menuOpen, setMenuOpen] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [projectToRename, setProjectToRename] = useState(null);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore using doc and user.uid
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userDocData = userDocSnapshot.data();
          const name = userDocData.name || user.displayName || "User";
          setUserData({ name });
        } else {
          // Handle case where user document is not found
          setUserData({ name: "User" });
        }

        fetchProjects(user.uid);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchProjects = (userId) => {
    const projectsQuery = query(
      collection(db, "projects"),
      where("userId", "==", userId)
    );
  
    const unsubscribe = onSnapshot(
      projectsQuery,
      (snapshot) => {
        // Map through the documents and filter locally for projects not "deleted"
        const projectList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((project) => project.status !== "deleted"); // Local filtering
  
        setProjects(projectList); // Update state with the filtered list
      },
      (error) => {
        console.error("Error listening to projects:", error);
      }
    );
  
    // Return the unsubscribe function to stop listening when the component unmounts
    return unsubscribe;
  };
  
  const handleMenuToggle = (projectId, event) => {
    event.stopPropagation();
    setMenuOpen((prev) => (prev === projectId ? null : projectId));
  };

  const handleFileManager = (projectId) => {
    navigate(`/${projectId}/file-manager`);
  };

  const handleProjectCreate = async (newProjectData) => {
    try {
      const newProjectRef = await addDoc(
        collection(db, "projects"),
        newProjectData
      );
      const newProject = { id: newProjectRef.id, ...newProjectData };
      setProjects((prevProjects) => [...prevProjects, newProject]);
      toast.success("Successfully created a new project");
    } catch (error) {
      toast.error("Failed to create project");
      console.error("Error creating project:", error);
    }
  };

  const handleProjectRename = async (projectId, newName) => {
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, { name: newName });
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId ? { ...project, name: newName } : project
        )
      );
      toast.success("Project name updated successfully");
    } catch (error) {
      toast.error("Failed to update project name");
      console.error("Error updating project name:", error);
    }
  };

  const handleProjectDelete = async (projectId) => {
    if (!projectId) return;
    try {
      const projectRef = doc(db, "projects", projectId);
      await deleteDoc(projectRef);
      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== projectId)
      );
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete the project. Please try again.");
      console.error("Error deleting project:", error);
    }
    setShowTrashModal(false);
  };

  const toggleProjectStatus = async (project) => {
    try {
      const newStatus = project.status === "active" ? "disabled" : "active";
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, { status: newStatus });

      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === project.id ? { ...p, status: newStatus } : p
        )
      );

      toast.success(
        `Project is now ${newStatus === "active" ? "enabled" : "disabled"}`
      );
    } catch (error) {
      toast.error("Failed to update project status");
    }
  };

  const showOwnerDashboard = (project) => {
    if (project.status === "active") {
      navigate(`/${project.id}/dashboard`);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <section className="m-3 md:m-10 md:min-h-[calc(100vh-64px)]">
        <h1 className="text-2xl md:text-3xl font-bold my-8 text-yellow-800">
          Hello, {userData.name}
        </h1>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center items-start">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 sm:mt-0 mb-4 sm:mb-0">
            My Sites
          </h2>
          <div className="flex items-center justify-end space-x-4 w-full sm:w-auto">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="bg-gray-200 p-2 rounded sm:w-auto"
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
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-6 rounded-lg font-semibold transition duration-200 ease-in-out sm:w-auto flex items-center justify-center"
            >
              <FaPlus className="mr-2" />
              Create New Site
            </button>
          </div>
        </div>

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
              className="bg-white p-4 rounded-lg shadow-md cursor-pointer relative"
              onClick={() => navigate(`/design/${project.id}`)} // Updated route to "/design"
            >
              <div className="flex justify-between">
                <h3 className="text-lg font-bold">{project.name}</h3>
                <BsThreeDots
                  className={`relative ${
                    menuOpen === project.id
                      ? "ring-2 ring-slate-700 rounded-full"
                      : ""
                  } m-1`}
                  onClick={(e) => handleMenuToggle(project.id, e)}
                />
              </div>

              {menuOpen === project.id && (
                <div className="absolute bg-white shadow-lg rounded-lg right-0 z-10 transition-all transform origin-top scale-y-100"                
                >
                  <button
                    className="block w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   setProjectToRename(project);
                    //   setShowRenameModal(true);
                    //   setMenuOpen(null); // Close the menu when Edit is clicked
                    // }}
                    onClick={() => navigate(`/design/${project.id}`)}
                  >
                    <div className="flex items-center justify-start p-2">
                      <FaPencilAlt className="mr-2" /> Edit
                    </div>
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-red-600 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project.id);
                      setShowTrashModal(true);
                      setMenuOpen(null);
                    }}
                  >
                    <div className="flex items-center justify-start p-2">
                      <FaTrashAlt className="mr-2" /> Delete
                    </div>
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-violet-600 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileManager(project.id);
                    }}
                  >
                    <div className="flex items-center justify-start p-2">
                      <IoFolderOpen className="mr-2" /> File Manager
                    </div>
                  </button>

                  <button
                    className={`block w-full px-4 py-2 text-blue-600 hover:bg-blue-100 ${
                      project.status !== "active"
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (project.status === "active") {
                        showOwnerDashboard(project);
                      }
                    }}
                    disabled={project.status !== "active"}
                  >
                    <div className="flex items-center justify-start p-2">
                      <BiSolidDashboard className="mr-2" /> Dashboard
                    </div>
                  </button>
                  <button
                    className={`block w-full px-4 py-2 ${
                      project.status === "active"
                        ? "text-green-600 hover:bg-green-100"
                        : project.status === "disabled"
                        ? "text-gray-600 hover:bg-gray-100"
                        : "cursor-not-allowed opacity-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (project.status !== "pending") {
                        toggleProjectStatus(project);
                      }
                    }}
                    disabled={project.status === "pending"}
                  >
                    <div className="flex items-center justify-start p-2">
                      <input
                        type="checkbox"
                        className={`toggle toggle-xs mr-2 ${
                          project.status === "disabled" ? "" : "toggle-success"
                        }`}
                        checked={project.status === "active"}
                        disabled={project.status === "pending"}
                      />
                      {project.status === "active"
                        ? "Disable Site"
                        : "Enable Site"}
                    </div>
                  </button>
                </div>
              )}

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
      <Footer />

      <ModalRename
        show={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        project={projectToRename}
        onProjectRename={handleProjectRename}
      />

      <NewProjectModal
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

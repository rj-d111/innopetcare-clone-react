import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { db } from "../firebase"; // Import Firebase
import { collection, addDoc, getDocs } from "firebase/firestore"; // Firestore methods
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase Auth
import { toast } from "react-toastify";

// Modal Component for Creating New Project
const Modal = ({ show, onClose, onProjectCreate }) => {
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("Veterinary Site");

  if (!show) return null;

  const handleCreateProject = async () => {
    // Create a new project in Firestore
    try {
      const projectData = {
        name: projectName,
        type: projectType,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "projects"), projectData);

      // Call the onProjectCreate callback to refresh the Home page
      onProjectCreate(projectData);

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error adding project: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
        {/* Close Button */}
        <IoClose
          className="text-red-600 text-2xl absolute top-4 right-4 cursor-pointer"
          onClick={onClose} // Close the modal when clicking the button
        />
        <h2 className="text-xl font-bold mb-4">
          How do you want to design your site?
        </h2>
        <label className="block mb-2">
          Project Name
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </label>
        <div className="mb-4">
          <p className="mb-2">Project Type</p>
          <div className="flex space-x-3">
            <label className="block mb-1">
              <input
                type="radio"
                name="projectType"
                value="Veterinary Site"
                checked={projectType === "Veterinary Site"}
                onChange={(e) => setProjectType(e.target.value)}
                className="mr-2"
              />
              Veterinary Site
            </label>
            <label className="block">
              <input
                type="radio"
                name="projectType"
                value="Animal Shelter"
                checked={projectType === "Animal Shelter"}
                onChange={(e) => setProjectType(e.target.value)}
                className="mr-2"
              />
              Animal Shelter
            </label>
          </div>
        </div>
        <button
          onClick={handleCreateProject}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-6 sm:mt-0 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
        >
          Create Project
        </button>
      </div>
    </div>
  );
};

// Home Component
export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
  });

  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      const projectsCollection = await getDocs(collection(db, "projects"));
      const projectList = projectsCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectList);
    };

    fetchProjects();
  }, []);

  // Fetch user data from Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData({
          name: user.displayName || "User", // Use displayName if available
        });
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  // Callback when a new project is created
  const handleProjectCreate = (newProject) => {
    toast.success("Successfully created a new project");
    setProjects((prevProjects) => [...prevProjects, newProject]);
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
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-6 sm:mt-0 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg flex items-center justify-center"
          >
            <FaPlus className="mr-2" />
            Create New Site
          </button>
        </div>

        {/* Display project cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold">{project.name}</h3>
              <p className="text-gray-600">{project.type}</p>
              <p className="text-sm text-gray-500">
                Created on:{" "}
                {new Date(project.createdAt.seconds * 1000).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Modal for creating a new project */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        onProjectCreate={handleProjectCreate}
      />
    </>
  );
}

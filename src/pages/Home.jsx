import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase"; // Import Firebase
import Modal from "../components/Modal";
import { toast } from "react-toastify";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
  });
  const [isLoading, setIsLoading] = useState(true); // isLoading state

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

  // Fetch user data and projects
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData({
          name: user.displayName || "User",
        });
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

  if (isLoading) {
    return null; // Do not render anything while loading
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

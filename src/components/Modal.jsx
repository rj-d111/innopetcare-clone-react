import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { getAuth } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase"; // Import Firebase

const Modal = ({ show, onClose, onProjectCreate }) => {
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("Veterinary Site");

  if (!show) return null;

  const handleCreateProject = async () => {
    const auth = getAuth(); // Get Firebase Auth instance
    const user = auth.currentUser; // Get the current logged-in user

    if (!user) {
      console.error("No user is logged in");
      return;
    }

    try {
      const projectData = {
        name: projectName,
        type: projectType,
        createdAt: new Date(),
        userId: user.uid, // Store the user's UID
      };

      await addDoc(collection(db, "projects"), projectData);
      onProjectCreate(projectData);
      onClose();
    } catch (error) {
      console.error("Error adding project: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
        <IoClose
          className="text-red-600 text-2xl absolute top-4 right-4 cursor-pointer"
          onClick={onClose} 
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

export default Modal;

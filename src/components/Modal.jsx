import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { getAuth } from "firebase/auth";
import { addDoc, updateDoc, doc, collection } from "firebase/firestore";
import { db } from "../firebase";

const Modal = ({ show, onClose, onProjectCreate, project }) => {
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState("Veterinary Site");

  // Populate modal fields when a project is provided for editing
  useEffect(() => {
    if (project) {
      setProjectName(project.name || "");
      setProjectType(project.type || "Veterinary Site");
    } else {
      // Reset fields when creating a new project
      setProjectName("");
      setProjectType("Veterinary Site");
    }
  }, [project]);

  if (!show) return null;

  const handleSaveProject = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is logged in");
      return;
    }

    try {
      if (project) {
        // If editing an existing project
        const projectRef = doc(db, "projects", project.id);
        await updateDoc(projectRef, {
          name: projectName,
          type: projectType,
        });
        onClose();
      } else {
        // If creating a new project
        const projectData = {
          name: projectName,
          type: projectType,
          createdAt: new Date(),
          userId: user.uid,
          status: "pending",
        };
        const docRef = await addDoc(collection(db, "projects"), projectData);
        onProjectCreate({ id: docRef.id, ...projectData });
        onClose();
      }
    } catch (error) {
      console.error("Error saving project: ", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
        <IoClose
          className="absolute top-2 right-2 text-2xl cursor-pointer"
          onClick={onClose}
        />
        <h2 className="text-xl font-bold mb-4">
          {project ? "Edit Project" : "Create New Site"}
        </h2>

        <label className="block mb-2 text-gray-700">Project Name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />

        <label className="block mb-2 text-gray-700">Project Type</label>
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        >
          <option>Veterinary Site</option>
          <option>Animal Shelter Site</option>
        </select>

        <button
          onClick={handleSaveProject}
          className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg w-full font-semibold transition duration-200"
        >
          {project ? "Save Changes" : "Create"}
        </button>
      </div>
    </div>
  );
};

export default Modal;

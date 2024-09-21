import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Firestore instance

const ModalRename = ({ show, onClose, project, projects, onProjectRename }) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (project) {
      setNewName(project.name); // Reset input value when the modal opens
    }
  }, [project]);

  // Handle renaming the project
  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error('File name cannot be empty. Please try again.');
      return;
    }

    const nameExists = projects.some(
      (existingProject) => existingProject.name.toLowerCase() === newName.toLowerCase() && existingProject.id !== project.id
    );

    if (nameExists) {
      toast.error('File name already taken. Please try again.');
      return;
    }

    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, { name: newName });
      onProjectRename(project.id, newName);
      toast.success('Project renamed successfully.');
      onClose(); // Close the modal
    } catch (error) {
      toast.error('Error renaming project. Please try again.');
      setNewName(project.name); // Reset to original name if the rename fails
    }
  };

  if (!show || !project) return null; // Do not render if modal is hidden or project is null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose} // Close when clicking outside the modal
    >
      <div
        className="bg-white rounded-lg p-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside the modal
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-600"
          onClick={onClose}
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Rename Project</h2>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        />

        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
            onClick={handleRename}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRename;

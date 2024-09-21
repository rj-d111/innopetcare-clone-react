import React, { useState, useEffect } from "react";
import { db } from "../../firebase.js";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ColorDropdown from "../ColorDropDown.jsx";

export default function GlobalSections() {
  const { projectUuid } = useParams(); // Get project UUID from the URL
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    headerColor: "#2196F3", // Default to blue
    headerTextColor: "#ffffff", // Default to white
  });

  useEffect(() => {
    if (projectUuid) {
      const docRef = doc(db, "projects", projectUuid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      });
      return unsubscribe;
    }
  }, [projectUuid]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (projectUuid) {
      const docRef = doc(db, "projects", projectUuid);
      updateDoc(docRef, { [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (projectUuid) {
      const docRef = doc(db, "projects", projectUuid);
      try {
        await updateDoc(docRef, formData);
        toast.success("Changes saved successfully!");
      } catch (error) {
        console.error("Error updating document:", error);
        toast.error("Failed to save changes.");
      }
    }
  };

  return (
    <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4">
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Global Sections</h2>
        <p className="text-sm text-gray-700">
          Global sections simplify displaying consistent content on multiple
          pages, like headers, footers, and sidebars.
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Name of Management System
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          placeholder="Enter here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Logo Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => updateField("logo", e.target.files[0]?.name)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-yellow-300"
        />
      </div>

      {/* Header Color Dropdown */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Color</label>
        <ColorDropdown
          onColorSelect={(color) => updateField("headerColor", color)}
        />
      </div>

      {/* Header Text Color Dropdown */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Text Color</label>
        <ColorDropdown
          onColorSelect={(color) => updateField("headerTextColor", color)}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
      >
        Save Changes
      </button>
    </div>
  );
}

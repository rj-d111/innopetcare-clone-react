import React, { useState } from "react";
import { db } from "../../firebase.js";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import ColorDropdown from "../ColorDropDown.jsx"; // Assuming you have a ColorDropdown component
import Spinner from "../Spinner.jsx"; // Assuming you have a Spinner component
import { useParams } from "react-router-dom";

export default function GlobalSections() {
  const auth = getAuth();
  const { id } = useParams(); // Get project UUID from the URL
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    headerColor: "",
    headerTextColor: "",
    logoPicture: null, // Single image
  });
  const [image, setImage] = useState(null);

  // Handle form changes
  function onChange(e) {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]); // Set the image file

      setFormData((prevState) => ({
        ...prevState,
        logoPicture: e.target.files[0], // Update the formData with the image
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.value,
      }));
    }
  }

  // Upload image to Firebase Storage and return the download URL
  async function storeImage(image) {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  }

  // Handle form submission
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (
      !formData.name ||
      !formData.slug ||
      !formData.headerColor ||
      !formData.headerTextColor ||
      !image // Ensure the image is set before submitting
    ) {
      setLoading(false);
      toast.error("Please fill all the required fields");
      return;
    }

    try {
      // Upload the logo image and get the URL
      const logoPictureUrl = await storeImage(image);

      // Update Firestore with form data and logo URL
      const docRef = doc(db, "projects", id);
      await updateDoc(docRef, {
        name: formData.name,
        slug: formData.slug,
        headerColor: formData.headerColor,
        headerTextColor: formData.headerTextColor,
        logoPicture: logoPictureUrl, // Save the logo image URL
        projectId: id,
      });

      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  }

  // Display loading spinner while saving
  if (loading) {
    return <Spinner />;
  }

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
          onChange={onChange}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Slug (ex. fort-deo)</label>

        <div className="bg-yellow-100 p-4 rounded-md">
          <p className="text-xs">
            Note: Spaces or special characters like !, @, #, $, %, &, *, etc.
            are not allowed. Instead, use hyphens (-) to separate words. For
            example, use my-page instead of my page
          </p>
        </div>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          placeholder="Enter here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          onChange={onChange}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Logo Picture</label>
        <input
          type="file"
          id="logoPicture"
          accept="image/*"
          onChange={onChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-yellow-300"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Color</label>
        <ColorDropdown
          color={formData.headerColor} // Pass the current header color
          onColorSelect={(color) =>
            setFormData((prev) => ({ ...prev, headerColor: color }))
          }
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Text Color</label>
        <ColorDropdown
          color={formData.headerTextColor} // Pass the current header text color
          onColorSelect={(color) =>
            setFormData((prev) => ({ ...prev, headerTextColor: color }))
          }
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
      >
        Save Changes
      </button>
    </div>
  );
}

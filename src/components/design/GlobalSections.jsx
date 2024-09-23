import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore"; // Firestore methods
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

export default function GlobalSections({ formData, setFormData }) {
  const auth = getAuth();
  const { id } = useParams(); // Get project UUID from the URL
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [documentExists, setDocumentExists] = useState(false);

  useEffect(() => {
    const checkDocumentExists = async () => {
      const q = query(
        collection(db, "global-sections"),
        where("projectId", "==", id)
      ); // Use the project ID here
      const querySnapshot = await getDocs(q);

      setDocumentExists(!querySnapshot.empty); // Set state based on query result
    };

    checkDocumentExists();
  }, [id]);

  // Handle form changes
  function onChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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

  // Check if the slug already exists in the global-sections collection
  async function isSlugDuplicate(slug) {
    const slugQuery = query(
      collection(db, "global-sections"),
      where("slug", "==", slug)
    );
    const slugSnapshot = await getDocs(slugQuery);
    return !slugSnapshot.empty; // Returns true if the slug is already in use
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
      !image
    ) {
      setLoading(false);
      toast.error("Please fill all the required fields");
      return;
    }

    try {
      // Check for duplicate slug
      const slugExists = await isSlugDuplicate(formData.slug);
      if (slugExists) {
        setLoading(false);
        toast.error("Slug name already been used, please choose another one.");
        return;
      }

      // Upload the image and get the URL
      const logoPictureUrl = await storeImage(image);
      const q = query(
        collection(db, "global-sections"),
        where("projectId", "==", id)
      ); // Use the project ID here
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Document exists, update it
        const docRef = querySnapshot.docs[0].ref; // Get the reference of the first matching document
        await updateDoc(docRef, {
          name: formData.name,
          slug: formData.slug,
          headerColor: formData.headerColor,
          headerTextColor: formData.headerTextColor,
          image: logoPictureUrl, // Save the uploaded image URL
        });
        toast.success("Global section updated successfully!");
      } else {
        await addDoc(collection(db, "global-sections"), {
          name: formData.name,
          slug: formData.slug,
          headerColor: formData.headerColor,
          headerTextColor: formData.headerTextColor,
          image: logoPictureUrl, // Store the uploaded image URL
          projectId: id, // Link to the related project
        });
        toast.success("Global section created successfully!");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
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
      !image
    ) {
      setLoading(false);
      toast.error("Please fill all the required fields");
      return;
    }

    try {
      // Upload the image to Firebase Storage and get the URL
      const logoPictureUrl = await storeImage(image);

      // Add the global-sections data to Firestore
      await addDoc(collection(db, "global-sections"), {
        name: formData.name,
        slug: formData.slug,
        headerColor: formData.headerColor,
        headerTextColor: formData.headerTextColor,
        image: logoPictureUrl, // Store the uploaded image URL
        projectId: id, // Link to the related project
      });

      toast.success("Global section saved successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
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
      className={`w-full uppercase py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:shadow-lg ${
        documentExists 
          ? "bg-violet-600 hover:bg-violet-700 active:bg-violet-800" 
          : "bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800"
      } text-white`}
    >
      {documentExists ? "Update Changes" : "Save Changes"}
    </button>
    </div>
  );
}

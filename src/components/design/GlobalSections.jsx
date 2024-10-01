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

export default function GlobalSections({
  formData,
  setFormData,
  setImagePreview,
}) {
  const auth = getAuth();
  const { id } = useParams(); // Get project UUID from the URL
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [documentExists, setDocumentExists] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // State for image preview URL

  // Fetch document if it exists and populate the form
  useEffect(() => {
    const fetchDocument = async () => {
      const q = query(
        collection(db, "global-sections"),
        where("projectId", "==", id)
      ); // Use the project ID here
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data(); // Get the document data
        setFormData({
          name: docData.name || "",
          slug: docData.slug || "",
          headerColor: docData.headerColor || "",
          headerTextColor: docData.headerTextColor || "",
          logoPicture: docData.image || "", // Set logo URL if exists
        });
        setDocumentExists(true); // Document exists
      } else {
        setDocumentExists(false); // Document doesn't exist
      }
    };

    fetchDocument();
  }, [id, setFormData]);

  // Function to create slug from the name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  };

  // Handle form changes
  function onChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      const newSlug = generateSlug(value);
      setFormData((prev) => ({ ...prev, slug: newSlug })); // Automatically set slug based on name
    }

    if (e.target.files && e.target.files[0]) {
      const uploadedImage = e.target.files[0];
      setImage(uploadedImage); // Set the image file
      setFormData((prevState) => ({
        ...prevState,
        logoPicture: uploadedImage, // Update the formData with the image
      }));

      // Preview the image
      const imagePreviewUrl = URL.createObjectURL(uploadedImage);
      setImagePreview(imagePreviewUrl); // Set the image preview in the parent
      setImagePreviewUrl(imagePreviewUrl); // Set the image preview in the parent
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

  // Check for duplicate slug
  const checkSlugExists = async (slug) => {
    const q = query(
      collection(db, "global-sections"),
      where("slug", "==", slug)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Return true if slug exists
  };

  // Function to validate the slug
  const isSlugValid = (slug) => {
    const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/; // Slug should contain only lowercase letters, numbers, and hyphens
    return regex.test(slug);
  };

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
    // Check if slug is valid
    if (!isSlugValid(formData.slug)) {
      setLoading(false);
      toast.error(
        "Slug cannot contain capital letters, spaces, or special characters like !, @, #, $, %, &, *"
      );
      return;
    }

    // Check if slug already exists
    const slugExists = await checkSlugExists(formData.slug);
    if (slugExists) {
      setLoading(false);
      toast.error("Slug has been taken, please rename it.");
      return;
    }

    try {
      // Upload the image and get the URL
      const logoPictureUrl = image
        ? await storeImage(image)
        : formData.logoPicture;
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
          accept="image/*"
          onChange={onChange}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
        />
      </div>
      {/* Image Preview Section */}
      {/* Image Preview Section */}
      {imagePreviewUrl && (
        <div className="mt-4">
          <h3 className="text-sm font-medium">Logo Preview:</h3>
          <img
            src={imagePreviewUrl}
            alt="Logo Preview"
            className="mt-2 w-32 h-32 object-cover rounded"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Color</label>
        <ColorDropdown
          selectedColor={formData.headerColor}
          setSelectedColor={(color) =>
            setFormData((prev) => ({ ...prev, headerColor: color }))
          }
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Text Color</label>
        <ColorDropdown
          selectedColor={formData.headerTextColor}
          setSelectedColor={(color) =>
            setFormData((prev) => ({ ...prev, headerTextColor: color }))
          }
        />
      </div>

      {/* <div className="space-y-1">
        <label className="block text-sm font-medium">Logo</label>
        <input
          type="file"
          id="logoPicture"
          accept="image/*"
          onChange={onChange}
          className="border border-gray-300 rounded-md px-2 py-1"
        />
      </div> */}

      <button
        type="button"
        onClick={onSubmit}
        className={`w-full uppercase py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:shadow-lg ${
          loading
            ? "bg-yellow-200" // While loading, maintain the yellow color
            : documentExists
            ? "bg-violet-500 hover:bg-violet-400 text-white" // If updating, change the color to violet
            : "bg-yellow-500 hover:bg-yellow-400 text-white" // If saving, keep the yellow color
        }`}
      >
        {documentExists ? "Update Changes" : "Save Changes"}
      </button>
    </div>
  );
}

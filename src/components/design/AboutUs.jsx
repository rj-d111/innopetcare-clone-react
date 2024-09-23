import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import { doc, updateDoc, getDoc, addDoc, collection, getDocs, where, query } from "firebase/firestore"; // Firestore methods
import { getAuth } from "firebase/auth";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Spinner from "../Spinner.jsx"; // Assuming you have a Spinner component
import { useParams } from "react-router-dom";

export default function AboutUs() {
  const { id } = useParams(); // Get project UUID from the URL
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [documentExists, setDocumentExists] = useState(false);

  useEffect(() => {
    const checkDocumentExists = async () => {
      const q = query(
        collection(db, "about-sections"),
        where("projectId", "==", id)
      ); // Use the project ID here
      const querySnapshot = await getDocs(q);

      setDocumentExists(!querySnapshot.empty); // Set state based on query result
    };

    checkDocumentExists();
  }, [id]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    picture: null,
  });

  const [image, setImage] = useState(null);

  // Handle form changes
  function onChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]); // Set the image file
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
    if (!formData.title || !formData.description || !image) {
      setLoading(false);
      toast.error("Please fill all the required fields");
      return;
    }

    try {
      // Upload the image and get the URL
      const pictureUrl = await storeImage(image);

      const docRef = doc(db, "about-sections", id); // Document reference for About Us sections
      const docSnap = await getDoc(docRef);

      const q = query(collection(db, "about-sections"), where("projectId", "==", id)); // Use the project ID here
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref; // Get the reference of the first matching document
        await updateDoc(docRef, {
          title: formData.title,
          description: formData.description,
          picture: pictureUrl, // Save the uploaded picture URL
          projectId: id, // Foreign key linking to the project
        });
        toast.success("About us section updated successfully!");

      }
      // If the document exists, update it; otherwise, create a new one
      else {
        await addDoc(collection(db, "about-sections"), {
          title: formData.title,
          description: formData.description,
          picture: pictureUrl, // Store the uploaded picture URL
          projectId: id, // Foreign key linking to the project
        });
        toast.success("About Us section created successfully!");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {loading && <Spinner />}
      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">About Us Page</h2>
          <p className="text-sm text-gray-700">
            The “About Us” page is designed to share the important story of who
            you are and what matters to us. It highlights the management system
            and lets customers know where you are located.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="Enter your title here"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Your description here"
            className="textarea textarea-sm w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
            required
          ></textarea>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">About Us Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-yellow-300"
            required
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
    </form>
  );
}

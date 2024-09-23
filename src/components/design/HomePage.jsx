import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import { doc, updateDoc, getDoc, addDoc, collection, query, where, getDocs } from "firebase/firestore"; // Firestore methods
import { getAuth } from "firebase/auth";
import { ref, getStorage, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Spinner from "../Spinner.jsx"; // Assuming you have a Spinner component
import { useParams } from "react-router-dom";

export default function HomePage({formData, setFormData}) {
  const { id } = useParams(); // Get project UUID from the URL
  const auth = getAuth();
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);

  const [documentExists, setDocumentExists] = useState(false);

  useEffect(() => {
    const checkDocumentExists = async () => {
      const q = query(
        collection(db, "home-sections"),
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
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
    if (!formData.title || !formData.subtext || !formData.content || !image) {
      setLoading(false);
      toast.error("Please fill all the required fields");
      return;
    }

    try {
      // Upload the image and get the URL
      const pictureUrl = await storeImage(image);
  
      // Query the home-sections collection to find the document with the matching projectId
      const q = query(collection(db, "home-sections"), where("projectId", "==", id)); // Use the project ID here
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Document exists, update it
        const docRef = querySnapshot.docs[0].ref; // Get the reference of the first matching document
        await updateDoc(docRef, {
          title: formData.title,
          subtext: formData.subtext,
          content: formData.content,
          picture: pictureUrl, // Save the uploaded picture URL
        });
        toast.success("Home section updated successfully!");
      } else {
        // Document doesn't exist, create a new one
        await addDoc(collection(db, "home-sections"), {
          title: formData.title,
          subtext: formData.subtext,
          content: formData.content,
          picture: pictureUrl, // Store the uploaded picture URL
          projectId: id, // Foreign key linking to the project
        });
        toast.success("Home section created successfully!");
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
          <h2 className="text-lg font-semibold">Home Page</h2>
          <p className="text-sm text-gray-700">
            A homepage is a webpage that serves as the starting point of a website.
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
          <label className="block text-sm font-medium">Subtext</label>
          <textarea
            id="subtext"
            name="subtext"
            value={formData.subtext}
            onChange={onChange}
            placeholder="Your subtext here"
            className="textarea textarea-sm w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
            required
          ></textarea>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-yellow-300"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={onChange}
            placeholder="Your content here"
            className="textarea textarea-sm w-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
            required
          ></textarea>
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

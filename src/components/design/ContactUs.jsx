import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, setDoc, getDoc, updateDoc, getDocs, query, collection, where, addDoc } from "firebase/firestore"; // Firestore functions
import { useParams } from "react-router"; // To get project ID
import { toast } from "react-toastify";
import Spinner from "../Spinner";

export default function ContactUs() {
  const { id } = useParams(); // Get project UUID from the URL
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    address: "",
    facebook: "",
  });
  const [isUpdateMode, setIsUpdateMode] = useState(false); // Track if the form is in update mode
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch existing contact info if it exists
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const q = query(
          collection(db, "contact-info"),
          where("projectId", "==", id)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0]; // Get the first matching document
          setContactInfo(docSnap.data()); // Populate form with existing data
          setIsUpdateMode(true); // Set update mode if document exists
        } else {
          setIsUpdateMode(false); // If no document, set to create mode
        }
        setLoading(false); // Data has been fetched, disable loading
      } catch (error) {
        console.error("Error fetching contact info:", error);
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
  };

  // Save or update contact info in Firestore
  const handleSave = async (e) => {
    try {
      // Validate required fields
      if (
        !contactInfo.phone ||
        !contactInfo.email ||
        !contactInfo.address ||
        !contactInfo.facebook
      ) {
        toast.error("Please fill all the required fields");
        return;
      }

      if (isUpdateMode) {
        // If in update mode, update the existing document
        const q = query(
          collection(db, "contact-info"),
          where("projectId", "==", id)
        );
        const querySnapshot = await getDocs(q);
        const docRef = querySnapshot.docs[0].ref; // Get the reference of the first matching document

        await updateDoc(docRef, contactInfo); // Update existing data
        toast.success("Contact section updated successfully!");
      } else {
        // If not in update mode, create a new document
        await addDoc(collection(db, "contact-info"), {
          ...contactInfo,
          projectId: id, // Foreign key linking to the project
        });
        toast.success("Contact section created successfully!");
        setIsUpdateMode(true); // Switch to update mode after saving
      }
    } catch (error) {
      toast.error("Failed to save changes: " + error.message);
    }
  };

  // If loading, show a loading message or spinner
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4">
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Contact Us Page</h2>
        <p className="text-sm text-gray-700">
          This page provides contact information such as phone number, email,
          and Facebook.
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Phone No.</label>
        <input
          type="text"
          name="phone"
          required
          value={contactInfo.phone}
          onChange={handleChange}
          placeholder="Enter your phone no. here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          required
          value={contactInfo.email}
          onChange={handleChange}
          placeholder="Enter your email address here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Address</label>
        <input
          type="text"
          name="address"
          required
          value={contactInfo.address}
          onChange={handleChange}
          placeholder="Enter your address here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Facebook Page Link</label>
        <input
          type="text"
          name="facebook"
          value={contactInfo.facebook}
          onChange={handleChange}
          placeholder="Paste your Facebook link here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        className={`w-full uppercase ${
        isUpdateMode ? "bg-violet-600 hover:bg-violet-700 active:bg-violet-800" 
          : "bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800"
      } text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out`}
      >
        {isUpdateMode ? "Update Changes" : "Save Changes"}
      </button>
    </div>
  );
}

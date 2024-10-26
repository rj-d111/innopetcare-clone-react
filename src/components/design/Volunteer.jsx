import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase"; // Adjust the import based on your Firebase setup
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import required functions
import { toast } from "react-toastify";

export default function Volunteer() {
  const { id } = useParams(); // Get projectId from the URL
  const [formData, setFormData] = useState({
    title: "",
    subtext: "",
    content: "",
    picture: null,
  });
  const storage = getStorage();

  const [documentExists, setDocumentExists] = useState(false); // Manage document state (for update or save)

  // Handle input changes
  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "picture") {
      setFormData({ ...formData, picture: files[0] }); // Handle file input
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit the form
  const onSubmit = async () => {
    if (formData.title && formData.subtext && formData.content && formData.picture) {
      try {
        const volunteerRef = collection(db, "volunteer");

        // Create a reference to the file to be uploaded
        const storageRef = ref(storage, `volunteer-images/${formData.picture.name}`);
        
        // Upload image to Firebase Storage
        await uploadBytes(storageRef, formData.picture);
        
        // Get the download URL of the uploaded image
        const pictureUrl = await getDownloadURL(storageRef);

        // Add document to Firestore
        await addDoc(volunteerRef, {
          ...formData,
          picture: pictureUrl, // Add image URL to document
          projectId: id, // Include the projectId
        });

        // Reset form or update state as needed
        setFormData({ title: "", subtext: "", content: "", picture: null });
        setDocumentExists(true);
        toast.success("Volunteer data saved successfully!"); // Show success message
      } catch (error) {
        console.error("Error uploading volunteer data: ", error);
        toast.error("Error uploading volunteer data: " + error.message); // Include the error message
      }
    } else {
      toast.error("Please fill in all fields."); // Basic validation
    }
  };

  return (
    <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-screen">
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Volunteer Page</h2>
        <p className="text-sm text-gray-700">
          A volunteer page is a section of a website dedicated to providing information about volunteer opportunities and how individuals can get involved with various causes or organizations.
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
          name="picture"
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-yellow-300"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Additional Info</label>
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
  );
}

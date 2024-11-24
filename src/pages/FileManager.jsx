import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { db } from "../firebase";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
  FaPencilAlt,
} from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import Spinner from "../components/Spinner";

export default function FileManager() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [documentUrls, setDocumentUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false); // To toggle between view and edit mode
  const [updatedData, setUpdatedData] = useState({}); // To track updated business details

  const handleAddDocuments = (files) => {
    const newDocuments = Array.from(files).map((file) => ({
      name: file.name,
      file,
    }));

    setDocumentUrls((prev) => [...prev, ...newDocuments]);
  };

  const handleReplaceDocument = (index) => {
    const newFileInput = document.createElement("input");
    newFileInput.type = "file";
    newFileInput.accept = ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx";
    newFileInput.onchange = (e) => {
      const newFile = e.target.files[0];
      if (newFile) {
        setDocumentUrls((prev) =>
          prev.map((doc, i) =>
            i === index ? { name: newFile.name, file: newFile } : doc
          )
        );
      }
    };
    newFileInput.click();
  };

  const handleDeleteDocument = (index) => {
    setDocumentUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const saveDocuments = async () => {
    try {
      const updatedDocumentFiles = [];

      // Iterate through documentUrls to handle both new and existing files
      for (const doc of documentUrls) {
        if (doc.file) {
          // New file: upload to Firebase Storage
          const storageRef = ref(
            getStorage(),
            `project-documents/${id}/${doc.name}`
          );
          await uploadBytes(storageRef, doc.file);
          const url = await getDownloadURL(storageRef);
          updatedDocumentFiles.push({ name: doc.name, url });
        } else if (doc.url) {
          // Existing file: keep it as is
          updatedDocumentFiles.push({ name: doc.name, url: doc.url });
        }
      }

      // Update Firestore with the new and existing files
      const projectRef = doc(db, "projects", id);
      await updateDoc(projectRef, { documentFiles: updatedDocumentFiles });

      toast.success("Documents updated successfully.");
      setEditMode(false); // Exit edit mode
      setUserData((prev) => ({ ...prev, documentFiles: updatedDocumentFiles })); // Update state with new document list
    } catch (error) {
      console.error("Error updating documents:", error);
      toast.error("Failed to update documents.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "projects", id);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserData(userData);
          setUpdatedData(userData); // Initialize updatedData with fetched data

          const storage = getStorage();
          const documentPromises = (userData.documentFiles || []).map(
            async (docFile) => {
              const fileRef = ref(storage, docFile.url);
              const fullUrl = await getDownloadURL(fileRef);
              return { name: docFile.name || "Unnamed Document", url: fullUrl };
            }
          );

          const urls = await Promise.all(documentPromises);
          setDocumentUrls(urls);
        } else {
          setUserData({});
          toast.error("Project not found.");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchUserData();
  }, [id]);

  const handleInputChange = (field, value) => {
    setUpdatedData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const saveUpdates = async () => {
    try {
      const userRef = doc(db, "projects", id);
      await updateDoc(userRef, updatedData);
      setUserData(updatedData); // Update local state
      setEditMode(false); // Exit edit mode
      toast.success("Business details updated successfully.");
    } catch (error) {
      console.error("Error updating business details:", error);
      toast.error("Failed to update business details.");
    }
  };

  if (!userData) {
    return <Spinner />;
  }

  // Function to determine file icon
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FaFilePdf className="text-red-600 mr-2" />;
      case "doc":
      case "docx":
        return <FaFileWord className="text-blue-600 mr-2" />;
      default:
        return <FaFileAlt className="text-gray-600 mr-2" />;
    }
  };

  // Function to check if the file is an image
  const isImageFile = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "gif"].includes(extension);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">File Manager</h2>

      <div className="mb-4">
        <strong>Name:</strong> {userData.name || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Created at:</strong>{" "}
        {userData.createdAt && userData.createdAt.seconds
          ? new Date(userData.createdAt.seconds * 1000).toLocaleString()
          : "N/A"}
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2">Business Details</h3>

      {/* Editable Fields */}
      <div className="mb-4">
        <strong>Type of Admin:</strong> {userData.type || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Legal Name/Company Name:</strong>{" "}
        {editMode ? (
          <input
            type="text"
            value={updatedData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="input input-bordered w-full"
          />
        ) : (
          userData.name || "N/A"
        )}
      </div>

      <div className="mb-4">
        <strong>Business Registration Number:</strong>{" "}
        {editMode ? (
          <input
            type="text"
            value={updatedData.businessRegNumber || ""}
            onChange={(e) =>
              handleInputChange("businessRegNumber", e.target.value)
            }
            className="input input-bordered w-full"
          />
        ) : (
          userData.businessRegNumber || "N/A"
        )}
      </div>

      <div className="mb-4">
        <strong>City:</strong>{" "}
        {editMode ? (
          <input
            type="text"
            value={updatedData.city || ""}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="input input-bordered w-full"
          />
        ) : (
          userData.city || "N/A"
        )}
      </div>

      <div className="mb-4">
        <strong>Postal Code:</strong>{" "}
        {editMode ? (
          <input
            type="text"
            value={updatedData.postalCode || ""}
            onChange={(e) => handleInputChange("postalCode", e.target.value)}
            className="input input-bordered w-full"
          />
        ) : (
          userData.postalCode || "N/A"
        )}
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2">Documents Submitted</h3>
      <div>
        {documentUrls.length > 0 ? (
          documentUrls.map((doc, index) => (
            <div key={index} className="mb-2 flex items-center">
              {isImageFile(doc.name) ? (
                <img
                  src={doc.url}
                  alt={doc.name}
                  className="h-20 w-20 object-cover rounded-md"
                />
              ) : (
                <button
                  onClick={() => window.open(doc.url, "_blank")}
                  className="flex items-center p-2 bg-gray-200 rounded-md"
                >
                  {getFileIcon(doc.name)}
                  <span>{doc.name}</span>
                </button>
              )}
              {editMode && (
                <div className="ml-4">
                  <button
                    className="btn btn-warning btn-sm mr-2"
                    onClick={() => handleReplaceDocument(index)}
                  >
                    Replace
                  </button>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => {
                      const confirmDelete = window.confirm(
                        "Are you sure you want to delete this document? This action cannot be undone."
                      );
                      if (confirmDelete) {
                        handleDeleteDocument(index);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="mb-2">No documents available</div>
        )}
        {editMode && (
          <div className="mt-4">
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
              onChange={(e) => handleAddDocuments(e.target.files)}
              className="block mb-4"
            />
          </div>
        )}
      </div>

      {/* Buttons for Edit and Save */}
      <div className="mt-6 flex space-x-4">
        {editMode ? (
          <>
            <button
              className="btn btn-primary"
              onClick={() => {
                saveUpdates(); // Save text fields
                saveDocuments(); // Save document changes
              }}
            >
              Save
            </button>
            <button
              className="btn btn-outline"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button className="btn btn-outline" onClick={() => setEditMode(true)}>
            <FaPencilAlt />
            Edit Business Information
          </button>
        )}
      </div>
    </div>
  );
}

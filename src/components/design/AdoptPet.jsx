import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import Spinner from "../Spinner";
import { FaFileCirclePlus } from "react-icons/fa6";
import { FaFilePdf } from "react-icons/fa";

export default function AdoptPet() {
  const { id } = useParams();
  const db = getFirestore();
  const storage = getStorage();

  const [isTypeAnimalShelter, setIsTypeAnimalShelter] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [shouldShowWarning, setShouldShowWarning] = useState(false);
  const [file, setFile] = useState(null);
  const [documentExists, setDocumentExists] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const adoptSectionRef = doc(db, "adopt-sections", id);
        const adoptSectionSnap = await getDoc(adoptSectionRef);
  
        if (adoptSectionSnap.exists()) {
          const adoptSectionData = adoptSectionSnap.data();
          setDocumentExists(true);
          setShouldShowWarning(false);
          setIsEnabled(adoptSectionData.isEnabled);
  
          // Set the file details for display
          if (adoptSectionData.adoptFile && adoptSectionData.fileName) {
            setFile({
              name: adoptSectionData.fileName,
              url: adoptSectionData.adoptFile,
            });
          }
        } else {
          setDocumentExists(false);
          setShouldShowWarning(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchProjectData();
  }, [id, db]);

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return null;
    }
  
    // Generate the storage reference and file path
    const storageRef = ref(storage, `adopt-sections/${id}_${file.name}`);
  
    // Upload the file to Firebase Storage
    await uploadBytes(storageRef, file);
  
    // Get the file's download URL
    const downloadURL = await getDownloadURL(storageRef);
  
    // Return both the download URL and file name
    return { downloadURL, fileName: file.name };
  };
  
  const onSubmit = async () => {
    setLoading(true);
  
    try {
      let uploadResult = null;
  
      // Only upload the file if isEnabled is true
      if (isEnabled && file) {
        uploadResult = await handleFileUpload();
      } else if (isEnabled && !file) {
        toast.error("Please select a file to upload.");
        setLoading(false);
        return;
      }
  
      // Save the document in Firestore
      await setDoc(doc(db, "adopt-sections", id), {
        adoptFile: isEnabled ? uploadResult.downloadURL : "", // Save the download URL
        fileName: isEnabled ? uploadResult.fileName : "", // Save the file name
        isEnabled: isEnabled,
        uploadedAt: new Date(),
      });
  
      toast.success("Adopt pet page saved successfully!");
      setDocumentExists(true);
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    setLoading(true);
  
    try {
      let uploadResult = null;
  
      // Only upload the file if isEnabled is true
      if (isEnabled && file) {
        uploadResult = await handleFileUpload(); // Returns { downloadURL, fileName }
      } else if (isEnabled && !file) {
        toast.error("Please select a file to upload.");
        setLoading(false);
        return;
      }
  
      // Update the Firestore document
      await setDoc(
        doc(db, "adopt-sections", id),
        {
          adoptFile: isEnabled && uploadResult ? uploadResult.downloadURL : "", // Save the download URL
          fileName: isEnabled && uploadResult ? uploadResult.fileName : "", // Save the file name
          isEnabled: isEnabled,
          uploadedAt: new Date(),
        },
        { merge: true } // Ensure that only updated fields are modified
      );
  
      toast.success("Adopt pet page updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update changes.");
    } finally {
      setLoading(false);
    }
  };
  

  const toggleAdoptPetPage = () => {
    if (!isTypeAnimalShelter) {
      setIsEnabled((prev) => !prev);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 md:max-w-full mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 h-full">
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Adopt Pet Page</h2>
        <p className="text-sm text-gray-700">
          An adopt pet page is a section of a website dedicated to connecting
          potential pet owners with animals in need of homes.
        </p>
      </div>

      {/* Alerts */}
      <div className="mt-6">
        {shouldShowWarning ? (
          <div role="alert" className="alert alert-warning p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Form incomplete. Please fill in all required fields and save your
              changes.
            </span>{" "}
          </div>
        ) : (
          <div role="alert" className="alert alert-success p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>"Adopt pet" page is successfully configured.</span>
          </div>
        )}
      </div>

      {/* Checkbox */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          className="toggle toggle-warning"
          checked={isEnabled}
          onChange={toggleAdoptPetPage}
          disabled={isTypeAnimalShelter}
        />
        <p className="ml-2">
          {isTypeAnimalShelter
            ? "Adopt Pet Page is automatically enabled for Animal Shelter Site"
            : "Enable Adopt Pet Page"}
        </p>
      </div>

      {/* File Upload */}
      {isEnabled && (
        <div className="mt-4">
          <label className="block text-sm font-medium">
            Upload Adoption Form (PDF)
          </label>
          <div className="mt-3">
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            >
              <FaFileCirclePlus className="mr-2 text-lg" />
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              name="document"
              accept=".pdf"
              onChange={(e) => {
                // Only allow one file to be selected
                if (e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            {file && (
              <div
                className={`mt-4 flex items-center bg-gray-100 p-3 rounded-lg shadow-md ${
                  file?.url ? "cursor-pointer" : ""
                }`}
                onClick={() => {
                  if (file?.url) {
                    window.open(file.url, "_blank");
                  }
                }}
              >
                {/* PDF Logo */}
                <FaFilePdf className="text-red-500 text-3xl mr-3 flex-shrink-0" />

                {/* File Name */}
                <div className="flex-1 overflow-hidden">
                  <span className="text-gray-700 font-medium truncate block">
                    {file.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={documentExists ? onUpdate : onSubmit}
        className={`w-full uppercase py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:shadow-lg ${
          loading
            ? "bg-yellow-200"
            : documentExists
            ? "bg-violet-500 hover:bg-violet-400 text-white"
            : "bg-yellow-500 hover:bg-yellow-400 text-white"
        }`}
      >
        {documentExists ? "Update Changes" : "Save Changes"}
      </button>
    </div>
  );
}

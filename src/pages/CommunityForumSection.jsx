import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

export default function CommunityForumSection() {
  const { id } = useParams();
  const db = getFirestore();

  const [isEnabled, setIsEnabled] = useState(true); // Enabled by default
  const [shouldShowWarning, setShouldShowWarning] = useState(false); // Warning if section not found
  const [documentExists, setDocumentExists] = useState(false); // Track if the document exists
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch section data from Firestore
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const sectionRef = doc(db, "community-forum-section", id);
        const sectionSnap = await getDoc(sectionRef);

        if (sectionSnap.exists()) {
          const sectionData = sectionSnap.data();
          setIsEnabled(sectionData.isEnabled); // Set the state based on the fetched data
          setDocumentExists(true); // Mark document as existing
          setShouldShowWarning(false); // No warning if the section is found
        } else {
          setShouldShowWarning(true); // Show warning if the section is not found
        }
      } catch (error) {
        console.error("Error fetching section data:", error);
        setShouldShowWarning(true); // Show warning if an error occurs
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    };

    fetchSectionData();
  }, [id, db]);

  const toggleAppointmentsSection = () => {
    setIsEnabled((prev) => !prev);
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const sectionRef = doc(db, "community-forum-section", id);

      await setDoc(sectionRef, {
        isEnabled,
        updatedAt: new Date(), // Optional: Add a timestamp
      });

      setDocumentExists(true);
      setShouldShowWarning(false);
      setLoading(false);
      toast.success("Community Forum Section saved successfully!");
    } catch (error) {
      console.error("Error saving section data:", error);
      setLoading(false);
      toast.error("Failed to save changes.");
    }
  };

  const onUpdate = async () => {
    setLoading(true);
    try {
      const sectionRef = doc(db, "community-forum-section", id);

      await setDoc(
        sectionRef,
        {
          isEnabled,
          updatedAt: new Date(), // Optional: Add a timestamp
        },
        { merge: true } // Merge updates with existing data
      );

      toast.success("Community Forum Section updated successfully!");
    } catch (error) {
      console.error("Error updating section data:", error);
      toast.error("Failed to update changes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Section Description */}
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Community Forum Section</h2>
        <p className="text-sm text-gray-700">
          The Community Forum Section serves as a dedicated space for users to
          engage, share ideas, and seek advice. Foster meaningful conversations
          by enabling this section, where members can connect, collaborate, and
          support one another on various topics of interest. Manage visibility
          and participation seamlessly with simple controls.
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
              Please configure this Community Forum Section and save your changes.
            </span>
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
            <span>Community Forum Section is successfully configured.</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div className="flex items-center mt-6 mb-6">
        <input
          type="checkbox"
          className="toggle toggle-warning"
          checked={isEnabled}
          onChange={toggleAppointmentsSection}
        />
        <label className="ml-3">Enable Community Forum Section</label>
      </div>

      {/* Save/Update Button */}
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

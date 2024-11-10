import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { TbPencil } from "react-icons/tb";
import { CiTrash } from "react-icons/ci";
import DonateSectionModal from "./DonateSectionModal";
import SectionsModalDelete from "./SectionsModalDelete";
import { toast } from "react-toastify";

export default function DonateSection() {
  const { id: projectId } = useParams();
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  // Fetch donation sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sectionsRef = collection(db, "donations", projectId, "sections");
        const sectionsQuery = query(
          sectionsRef,
          orderBy("sectionCreated", "asc")
        );
        const snapshot = await getDocs(sectionsQuery);

        const sectionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSections(sectionsList);
      } catch (error) {
        console.error("Error fetching donation sections:", error);
        toast.error("Error fetching donation sections.");
      }
    };
    fetchSections();
  }, [projectId]);

  // Refresh sections after adding or updating
  const handleSectionAdded = async () => {
    const sectionsRef = collection(db, "donations", projectId, "sections");
    const sectionsQuery = query(sectionsRef, orderBy("sectionCreated", "asc"));
    const snapshot = await getDocs(sectionsQuery);
    const sectionsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSections(sectionsList);
  };

  const handleEditClick = (section) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (section) => {
    setSectionToDelete(section);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const sectionRef = doc(db, "donations", projectId, "sections", sectionId);
      await deleteDoc(sectionRef);
      setSections((prevSections) =>
        prevSections.filter((s) => s.id !== sectionId)
      );
      toast.success("Section deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Error deleting section.");
    }
  };

  const shouldShowWarning = sections.length === 0;

  return (
    <>
      <div className="p-6 md:max-w-2xl mx-auto bg-gray-100 shadow-md rounded-lg space-y-4">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Donate Section</h2>
          <p className="text-sm text-gray-700">
            Manage your donation sections to provide users with information on
            how they can support your organization.
          </p>
        </div>
        {/* Conditional Messages */}
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
            <span>No sections added yet. Please add at least one section.</span>
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
            <span>Donations section page is successfully configured.</span>
          </div>
        )}

        {sections.map((section) => (
          <div key={section.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{section.sectionTitle}</h3>
              <div className="flex items-center space-x-2">
                <TbPencil
                  className="text-blue-600 cursor-pointer"
                  onClick={() => handleEditClick(section)}
                />
                <CiTrash
                  className="text-red-600 cursor-pointer"
                  onClick={() => handleDeleteClick(section)}
                />
              </div>
            </div>
            <p className="text-gray-600">{section.sectionSubtext}</p>
          </div>
        ))}

        <button
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Donation Section
        </button>
      </div>

      {isModalOpen && (
        <DonateSectionModal
          projectId={projectId}
          closeModal={() => setIsModalOpen(false)}
          onSectionAdded={handleSectionAdded}
          selectedSection={selectedSection}
        />
      )}

      {isDeleteModalOpen && (
        <SectionsModalDelete
          show={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          sectionTitle={sectionToDelete?.sectionTitle}
          onDelete={() => handleDeleteSection(sectionToDelete.id)}
        />
      )}
    </>
  );
}

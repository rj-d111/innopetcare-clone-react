import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import { TbPencil } from "react-icons/tb";
import { CiTrash } from "react-icons/ci";
import PetHealthRecordsSectionModal from "./PetHealthRecordsSectionModal";
import ModalDelete from "../ModalDelete"; // Your delete confirmation modal
import { useParams } from "react-router";
import { toast } from "react-toastify";
import PetHealthRecordsSectionModalDelete from "./PetHealthRecordsSectionModalDelete";
import AdoptionRecordSectionModal from "./AdoptionRecordSectionModal";
import AnimalRecordsSectionModalDelete from "./AnimalRecordSectionModalDelete";

export default function AdoptionRecordSection() {
  const { id } = useParams(); // Project ID from URL params
  const [healthSections, setHealthSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch pet health sections for a specific projectId
  useEffect(() => {
    const fetchHealthSections = async () => {
      if (!id) return;
  
      try {
        const sectionsRef = collection(db, "adoption-record-sections", id, "sections");
        const q = query(sectionsRef, orderBy("sectionCreated", "asc"));
        const querySnapshot = await getDocs(q);
  
        const sectionsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setHealthSections(sectionsList);
      } catch (error) {
        console.error("Error fetching health sections:", error);
      }
    };
  
    fetchHealthSections();
  }, [id]);

  // Define shouldShowWarning
  const shouldShowWarning = healthSections.length === 0;

  // Refresh the section list after adding or editing
  const handleSectionAddedOrEdited = async () => {
    if (!id) return;

    const sectionsRef = collection(db, "adoption-record-sections", id, "sections");
    const querySnapshot = await getDocs(query(sectionsRef));

    const sectionsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setHealthSections(sectionsList);
    setIsModalOpen(false); // Close modal after saving changes
  };

  // Open modal to edit a section
  const handleEditClick = (section) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  // Open modal to delete a section
  const handleDeleteClick = (section) => {
    setSectionToDelete(section);
    setIsDeleteModalOpen(true);
  };

  // Handle section deletion
  const handleDeleteSection = async () => {
    if (sectionToDelete) {
      try {
        const sectionRef = doc(
          db,
          "adoption-record-sections",
          id,
          "sections",
          sectionToDelete.id
        );
        await deleteDoc(sectionRef);
        setHealthSections((prevSections) =>
          prevSections.filter((section) => section.id !== sectionToDelete.id)
        );
        setIsDeleteModalOpen(false);
        setSectionToDelete(null);
      } catch (error) {
        console.error("Error deleting section:", error);
        toast.error("Error deleting section");
      }
    }
  };

  // Handle adding new section
  const handleAddSection = async (newSectionName) => {
    if (!newSectionName) return;
    try {
      const sectionsRef = collection(db, "adoption-record-sections", id, "sections");
      await addDoc(sectionsRef, { name: newSectionName });
      handleSectionAddedOrEdited(); // Refresh sections after adding
      toast.success("Section added successfully");
    } catch (error) {
      console.error("Error adding section:", error);
      toast.error("Error adding section");
    }
  };

  return (
    <>
      {isModalOpen && (
        <AdoptionRecordSectionModal
          projectId={id} // Pass the projectId as a prop
          closeModal={() => setIsModalOpen(false)}
          onSectionAddedOrEdited={handleSectionAddedOrEdited}
          selectedSection={selectedSection}
        />
      )}

      {isDeleteModalOpen && (
        <AnimalRecordsSectionModalDelete
          title="Delete Confirmation"
          message={`Are you sure you want to delete the section: "${sectionToDelete?.name}"? All data related to this section will be lost.`}
          onConfirm={handleDeleteSection}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}

      <div className="p-6 md:max-w-full  mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 h-full">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Adoption Records Section</h2>
          <p className="text-sm text-gray-700">
          Monitor the adoption process from inquiry to completion, ensuring every pet finds its forever home.
          </p>
        </div>

        {/* Conditional Warning */}
        {shouldShowWarning ? (
          <div role="alert" className="alert alert-warning">
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
              Please add at least a section for Adoption Records 
            </span>
          </div>
        ) : (
          <div role="alert" className="alert alert-success">
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
            <span>Successfully completed</span>
          </div>
        )}

        <div className="mt-4">
          {healthSections.length === 0 ? (
            <div className="bg-white h-40 text-sm text-gray-600 flex items-center justify-center">
              You currently have no health record sections.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {healthSections.map((section) => (
                <div
                  key={section.id}
                  className="p-4 bg-white rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{section.name}</h3>
                    <div className="justify-end flex">
                      <TbPencil
                        className="text-blue-600 cursor-pointer text-lg"
                        onClick={() => handleEditClick(section)}
                      />
                      <CiTrash
                        className="text-red-600 cursor-pointer text-lg"
                        onClick={() => handleDeleteClick(section)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-3 rounded-full font-semibold"
          onClick={() => {
            setSelectedSection(null); // Clear selectedSection
            setIsModalOpen(true); // Open modal to add new section
          }}
              >
          + Add Adoption Records Section
        </button>
      </div>
    </>
  );
}

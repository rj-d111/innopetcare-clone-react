import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import {
  doc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  setDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import AboutPageModal from "./AboutPageModal";
import SectionsModalDelete from "./SectionsModalDelete";
import { TbPencil } from "react-icons/tb";
import { CiTrash } from "react-icons/ci";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AboutPage() {
  const { id: projectId } = useParams();
  const [sections, setSections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  // Fetch sections from Firestore
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sectionsCollectionRef = collection(
          db,
          "about-sections",
          projectId,
          "sections"
        );
        const sectionsQuery = query(
          sectionsCollectionRef,
          orderBy("sectionCreated", "asc")
        );
        const querySnapshot = await getDocs(sectionsQuery);

        const sectionsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSections(sectionsList);
      } catch (error) {
        console.error("Error fetching sections:", error);
        toast.error("Error fetching About Us sections.");
      }
    };

    fetchSections();
  }, [projectId]);

    // Function to swap sections
    const swapSections = async (index1, index2) => {
      if (index1 < 0 || index2 >= sections.length || index2 < 0) return;
  
      const section1 = sections[index1];
      const section2 = sections[index2];
  
      try {
        const section1Ref = doc(
          db,
          "about-sections",
          projectId,
          "sections",
          section1.id
        );
        const section2Ref = doc(
          db,
          "about-sections",
          projectId,
          "sections",
          section2.id
        );
  
        // Swap their sectionCreated timestamps
        await setDoc(section1Ref, { ...section1, sectionCreated: section2.sectionCreated });
        await setDoc(section2Ref, { ...section2, sectionCreated: section1.sectionCreated });
  
        // Update the state to reflect changes
        const updatedSections = [...sections];
        [updatedSections[index1], updatedSections[index2]] = [
          updatedSections[index2],
          updatedSections[index1],
        ];
        setSections(updatedSections);
        toast.success("Successfully swapped sections");
      } catch (error) {
        console.error("Error swapping sections:", error);
        toast.error("Error swapping sections.");
      }
    };
    
  const handleSectionAdded = async () => {
    const sectionsCollectionRef = collection(
      db,
      "about-sections",
      projectId,
      "sections"
    );
    const sectionsQuery = query(
      sectionsCollectionRef,
      orderBy("sectionCreated", "asc")
    );
    const querySnapshot = await getDocs(sectionsQuery);

    const sectionsList = querySnapshot.docs.map((doc) => ({
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
      const sectionDocRef = doc(
        db,
        "about-sections",
        projectId,
        "sections",
        sectionId
      );
      await deleteDoc(sectionDocRef);
      setSections((prevSections) =>
        prevSections.filter((section) => section.id !== sectionId)
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
      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-full">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">About Us Page</h2>
          <p className="text-sm text-gray-700">
            Manage your "About Us" sections to provide information about your organization.
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
            <span>"About Us" page is successfully configured.</span>
          </div>
        )}

        {/* Section List */}
        {/* Section List */}
        {sections.map((section, index) => (
          <div key={section.id} className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{section.sectionTitle}</h3>
              <div className="flex items-center space-x-2">
                {/* Move Up Button */}
                {index > 0 && (
                  <FaArrowUp
                    className="text-green-600 cursor-pointer"
                    onClick={() => swapSections(index, index - 1)}
                  />
                )}
                {/* Move Down Button */}
                {index < sections.length - 1 && (
                  <FaArrowDown
                    className="text-red-600 cursor-pointer"
                    onClick={() => swapSections(index, index + 1)}
                  />
                )}
                <TbPencil
                  className="text-blue-600 cursor-pointer ml-2"
                  onClick={() => handleEditClick(section)}
                />
                <CiTrash
                  className="text-red-600 cursor-pointer ml-2"
                  onClick={() => handleDeleteClick(section)}
                />
              </div>
            </div>
            <p className="text-gray-700">{section.sectionSubtext}</p>
          </div>
        ))}

        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-3 rounded-full font-semibold mt-4"
          onClick={() => setIsModalOpen(true)}
        >
          + Add About Us Section
        </button>
      </div>

      {isModalOpen && (
        <AboutPageModal
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
          projectId={sectionToDelete?.id}
          onDelete={handleDeleteSection}
        />
      )}
    </>
  );
}

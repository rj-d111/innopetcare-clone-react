import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import OwnerAdoptionModalEdit from "./OwnerAdoptionModalEdit";
import OwnerAdoptionModalDelete from "./OwnerAdoptionModalDelete";
import Spinner from "../Spinner";
import { FaArchive, FaEdit, FaPrint, FaTrashAlt, FaUndo } from "react-icons/fa";
import OwnerHeaderPrint from "./OwnerHeaderPrint";
import PetInformation from "./records/PetInformation";
import PetRecords from "./records/PetRecords";
import AnimalAdoptionRecords from "./records/AnimalAdoptionRecords";

export default function OwnerAdoptionsDetails() {
  const { petId, id } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const closeEditModal = () => setIsEditModalOpen(false);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  // Fetch pet details from Firestore
  useEffect(() => {
    const docRef = doc(db, `adoptions/${id}/animals`, petId);
  
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setPetDetails(docSnap.data()); // Automatically updates `petDetails` when Firestore changes
        } else {
          toast.error("Pet not found.");
        }
      },
      (error) => {
        console.error("Error fetching pet details:", error);
        toast.error("Error fetching pet details.");
      }
    );
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [petId, id]);
  

  // Toggle Archive status
  const handleArchiveToggle = async () => {
    try {
      const docRef = doc(db, `adoptions/${id}/animals`, petId); // Reference in the animals subcollection
      
      // Toggle the `isArchive` field in Firestore
      await updateDoc(docRef, { isArchive: !petDetails.isArchive });
  
      // The `onSnapshot` listener will automatically update `petDetails`
      toast.success(
        `Pet ${petDetails.isArchive ? "restored" : "archived"} successfully!`
      );
    } catch (error) {
      console.error("Error updating archive status:", error);
      toast.error("Error updating archive status.");
    }
  };


  // Render loading if data isn't fetched yet
  if (!petDetails) {
    return <Spinner />;
  }

  const handlePrint = () => {
    window.print(); // Trigger the browser print dialog
  };

  return (
    <div>
      <OwnerHeaderPrint projectId={id} title={"Pet Adoption Record"} />
      {/* Action Buttons */}
      <div className="p-6 flex justify-end space-x-4 mb-4 print:hidden">
        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="btn  btn-secondary flex items-center gap-2"
        >
          <FaPrint />
          Print
        </button>

        {/* Edit Button */}
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="btn  btn-primary flex items-center gap-2"
        >
          <FaEdit />
          Edit
        </button>

        {/* Archive/Restore Button */}
        <button
          onClick={handleArchiveToggle}
          className={`btn  flex items-center gap-2 ${
            petDetails.isArchive ? "btn-secondary" : "btn-warning text-white"
          }`}
        >
          {petDetails.isArchive ? (
            <>
              <FaUndo />
              Restore
            </>
          ) : (
            <>
              <FaArchive />
              Archive
            </>
          )}
        </button>

        {/* Delete Button */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="btn  bg-red-600 text-white flex items-center gap-2"
        >
          <FaTrashAlt />
          Delete
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto print:shadow-none">
        {/* Header Section with Image */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0 print:mb-0">
            <img
              src={petDetails.image || "https://via.placeholder.com/100"}
              alt={petDetails.petName}
              className="rounded-full w-24 h-24 mr-4 object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">{petDetails.petName}</h2>
            </div>
          </div>
        </div>

        {/* Pet Information and Additional Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 print:grid-cols-2">
          {/* Pet Information */}
          <div>
            <h3 className="font-semibold">Pet Information</h3>
            <ul className="text-gray-700 mt-2">
              <li>
                <span className="font-bold">Birthdate:</span>{" "}
                {petDetails.birthdate || "N/A"}
              </li>
              <li>
                <span className="font-bold">Breed:</span>{" "}
                {petDetails.breed || "N/A"}
              </li>
              <li>
                <span className="font-bold">Color:</span>{" "}
                {petDetails.color || "N/A"}
              </li>
              <li>
                <span className="font-bold">Gender:</span>{" "}
                {petDetails.gender || "N/A"}
              </li>
              <li>
                <span className="font-bold">Species:</span>{" "}
                {petDetails.species || "N/A"}
              </li>
              <li>
                <span className="font-bold">Weight:</span>{" "}
                {petDetails.weight ? `${petDetails.weight} kg` : "N/A"}
              </li>
            </ul>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="font-semibold">Additional Details</h3>
            <ul className="text-gray-700 mt-2 print:mt-0">
              <li>
                <span className="font-bold">Description:</span>{" "}
                {petDetails.description || "N/A"}
              </li>
              <li>
                <span className="font-bold">Notes:</span>{" "}
                {petDetails.notes || "N/A"}
              </li>
            </ul>
          </div>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <OwnerAdoptionModalEdit projectId={id} uid={petId} closeModal={closeEditModal} />
        )}
        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <OwnerAdoptionModalDelete
            projectId={id}
            uid={petId}
            petName={petDetails.petName}
            closeDeleteModal={closeDeleteModal}
          />
        )}
      </div>
      {/* Pet Information Section */}
      <AnimalAdoptionRecords
        petUid={petId}
        projectId={id}
      />
    </div>
  );
}

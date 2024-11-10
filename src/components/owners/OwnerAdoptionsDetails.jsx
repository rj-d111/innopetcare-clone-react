import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import OwnerAdoptionModalEdit from "./OwnerAdoptionModalEdit";
import OwnerAdoptionModalDelete from "./OwnerAdoptionModalDelete";
import Spinner from "../Spinner";

export default function OwnerAdoptionsDetails() {
  const { petId } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const closeEditModal = () => setIsEditModalOpen(false);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  // Fetch pet details from Firestore
  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        const docRef = doc(db, "adoptions", petId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPetDetails(docSnap.data());
        } else {
          toast.error("Pet not found.");
        }
      } catch (error) {
        console.error("Error fetching pet details:", error);
        toast.error("Error fetching pet details.");
      }
    };
    fetchPetDetails();
  }, [petId]);

  // Toggle Archive status
  const handleArchiveToggle = async () => {
    try {
      const docRef = doc(db, "adoptions", petId);
      await updateDoc(docRef, { isArchive: !petDetails.isArchive });
      setPetDetails((prevDetails) => ({
        ...prevDetails,
        isArchive: !prevDetails.isArchive,
      }));
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

  return (
    <div>
      {/* Action Buttons */}
      <div className="p-6 flex justify-end space-x-4 mb-4">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="btn btn-sm btn-primary"
        >
          Edit
        </button>
        <button
          onClick={handleArchiveToggle}
          className={`btn btn-sm ${
            petDetails.isArchive ? "btn-warning" : "btn-secondary"
          }`}
        >
          {petDetails.isArchive ? "Restore" : "Archive"}
        </button>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="btn btn-sm bg-red-600 text-white"
        >
          Delete
        </button>
      </div>
      <div className="p-6 max-w-lg mx-auto">
        {/* Pet Image */}
        <div className="flex justify-center mb-4">
          <div className="avatar">
            <div className="mask mask-circle w-24 h-24">
              <img src={petDetails.image} alt={petDetails.petName} />
            </div>
          </div>
        </div>
        {/* Pet Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-3xl  text-center font-semibold mb-2">{petDetails.petName}</h2>
          <p>
            <strong>Birthdate:</strong> {petDetails.birthdate}
          </p>
          <p>
            <strong>Breed:</strong> {petDetails.breed}
          </p>
          <p>
            <strong>Color:</strong> {petDetails.color}
          </p>
          <p>
            <strong>Gender:</strong> {petDetails.gender}
          </p>
          <p>
            <strong>Species:</strong> {petDetails.species}
          </p>
          <p>
            <strong>Weight:</strong> {petDetails.weight} kg
          </p>
          <p>
            <strong>Notes:</strong> {petDetails.notes}
          </p>
        </div>
        {/* Edit Modal */}
        {isEditModalOpen && (
          <OwnerAdoptionModalEdit uid={petId} closeModal={closeEditModal} />
        )}
        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <OwnerAdoptionModalDelete
            uid={petId}
            petName={petDetails.petName}
            closeDeleteModal={closeDeleteModal}
          />
        )}
      </div>
    </div>
  );
}

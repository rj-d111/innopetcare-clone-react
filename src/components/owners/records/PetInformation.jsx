import React, { useState } from "react";
import { LuPencil } from "react-icons/lu";
import EditPetModal from "../EditPetsModal";
import { FaPrint } from "react-icons/fa";

// Helper function to calculate age from birth date
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust age if birth date hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const PetInformation = ({ pet = null, petUid, isClient = false }) => {
  const {
    petName,
    breed,
    species,
    gender,
    weight,
    color,
    existingConditions,
    birthdate, // Assuming birthDate is stored in your pet object
    image,
    allergies, // Add allergies here
  } = pet;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPetUid, setSelectedPetUid] = useState(null);

  const openModal = (petUid) => {
    setSelectedPetUid(petUid);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const age = calculateAge(birthdate);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* Header Section with Image and Edit Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src={image || "https://via.placeholder.com/100"}
              alt={petName}
              className="rounded-full w-24 h-24 mr-4 object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold">{petName}</h2>
            </div>
          </div>

          {!isClient && (
            <button
              className="btn btn-outline mt-4 md:mt-0 flex items-center space-x-2"
              onClick={() => openModal(petUid)}
            >
              <div className="flex flex-row px-3 md:space-x-3 items-center">
                <LuPencil className="text-lg" />
                <span>Edit Pet Information</span>
              </div>
            </button>
          )}
        </div>

        {/* Pet Information and Health Concerns Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Pet Information */}
          <div>
            <h3 className="font-semibold">Pet Information</h3>
            <ul className="text-gray-700 mt-2">
              <li>Age: {age}</li>
              <li>Birth Date: {birthdate}</li>
              <li>Species: {species}</li>
              <li>Breed: {breed}</li>
              <li>Gender: {gender}</li>
              <li>Weight: {weight} kg</li>
              <li>Color: {color}</li>
            </ul>
          </div>

          {/* Health Concerns */}
          <div>
            <h3 className="font-semibold">Health Concerns</h3>
            <ul className="text-gray-700 mt-2">
              <li>Allergies: {allergies || "None"}</li>
              <li>Existing Conditions: {existingConditions || "None"}</li>
            </ul>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EditPetModal petUid={selectedPetUid} closeModal={closeModal} />
      )}
    </>
  );
};

export default PetInformation;

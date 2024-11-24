import React, { useEffect, useState } from "react";
import PetSidebar from "./records/PetSidebar";
import PetInformation from "./records/PetInformation";
import OwnerInformation from "./records/OwnerInformation";
import PetRecords from "./records/PetRecords";
import { useParams } from "react-router";
import { FaPrint } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import OwnerHeaderPrint from "./OwnerHeaderPrint";

const OwnerPetHealthRecords = () => {
  const [selectedPet, setSelectedPet] = useState(''); // State to store selected pet information

  // Function to handle pet selection
  const handlePetSelect = (pet) => {
    setSelectedPet(pet); // Update the selected pet information
  };

  const handlePrint = () => {
    window.print();
  };


  return (
    <div className="flex print:block">
      {/* Sidebar for Pet Selection */}
      <PetSidebar onPetSelect={handlePetSelect} />

      <div className="w-3/4 py-4 px-4 print:py-0 print:w-full print:p-0">
        {/* Veterinarian Site Information at the top */}
        <OwnerHeaderPrint projectId={selectedPet.projectId} />

        {selectedPet ? (
          <>
            {/* Print Button (Visible only in normal mode) */}
            <div className="flex justify-end mb-4 print:hidden">
              <button className="btn btn-primary" onClick={handlePrint}

              >
                <FaPrint className="mr-2" />
                Print Pet Records
              </button>
            </div>


            {/* Pet Information Section */}
            <PetInformation pet={selectedPet} petUid={selectedPet.id} />

            {/* Owner Information Section */}
            <OwnerInformation clientId={selectedPet.clientId} />

            {/* Pet Records Section */}
            <PetRecords
              petUid={selectedPet.id}
              projectId={selectedPet.projectId}
            />
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <h2 className="text-xl text-gray-500">
              Please select a pet from the list
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerPetHealthRecords;

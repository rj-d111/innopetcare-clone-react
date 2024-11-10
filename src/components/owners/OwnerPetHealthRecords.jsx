import React, { useState } from "react";
import PetSidebar from "./records/PetSidebar";
import PetInformation from "./records/PetInformation";
import OwnerInformation from "./records/OwnerInformation";
import PetRecords from "./records/PetRecords";

const OwnerPetHealthRecords = () => {
  const [selectedPet, setSelectedPet] = useState(null); // State to store selected pet information

  console.log(selectedPet);
  // Function to handle pet selection
  const handlePetSelect = (pet) => {
    setSelectedPet(pet); // Update the selected pet information
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Pass the handler function to PetSidebar */}
      <PetSidebar onPetSelect={handlePetSelect} />
      
      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-bold text-red-600">Pet Health Records</h1>
        
        <div className="mt-4">
          {/* Pass the selected pet data as props */}
          {selectedPet && (
            <>
              <PetInformation pet={selectedPet} petUid={selectedPet.id}/>
              <OwnerInformation clientId={selectedPet.clientId} />
              <PetRecords petUid={selectedPet.id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerPetHealthRecords;

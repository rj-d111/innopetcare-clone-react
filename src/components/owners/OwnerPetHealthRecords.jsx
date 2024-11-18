import React, { useEffect, useState } from "react";
import PetSidebar from "./records/PetSidebar";
import PetInformation from "./records/PetInformation";
import OwnerInformation from "./records/OwnerInformation";
import PetRecords from "./records/PetRecords";
import { useParams } from "react-router";
import { FaPrint } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const OwnerPetHealthRecords = () => {
  const [selectedPet, setSelectedPet] = useState(null); // State to store selected pet information
  const [vetInfo, setVetInfo] = useState("");

  // Function to handle pet selection
  const handlePetSelect = (pet) => {
    setSelectedPet(pet); // Update the selected pet information
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const fetchVetInfo = async () => {
      if (selectedPet?.projectId) {
        try {
          const vetDocRef = doc(db, "global-sections", selectedPet.projectId);
          const vetDoc = await getDoc(vetDocRef);

          if (vetDoc.exists()) {
            setVetInfo(vetDoc.data());
          }
        } catch (error) {
          console.error("Error fetching veterinarian site information:", error);
        }
      }
    };

    fetchVetInfo();
  }, [selectedPet]);

  return (
    <div className="flex print:block">
      {/* Sidebar for Pet Selection */}
      <PetSidebar onPetSelect={handlePetSelect} />

      <div className="w-3/4 p-4 print:w-full print:p-0">
        {/* Veterinarian Site Information at the top */}
        {vetInfo && (
          <div className="mb-8 print:mb-4 print:block hidden">
            <nav className="flex items-start p-4">
              {vetInfo.image && (
                <img
                  src={vetInfo.image}
                  alt={vetInfo.name}
                  className="w-20 h-20 object-cover rounded-full mr-6"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {vetInfo.name}
                </h2>
                <p className="text-gray-600">{vetInfo.address}</p>
              </div>
            </nav>
          </div>
        )}

        {selectedPet ? (
          <>
            {/* Print Button (Visible only in normal mode) */}
            <div className="flex justify-end mb-4 print:hidden">
              <button className="btn btn-primary" onClick={handlePrint}>
                <FaPrint className="mr-2" />
                Print Pet Records
              </button>
            </div>

            {/* Pet Health Records Heading */}
            <h1 className="text-3xl font-bold text-blue-600 mb-6 print:mt-0">
              Pet Health Records
            </h1>

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

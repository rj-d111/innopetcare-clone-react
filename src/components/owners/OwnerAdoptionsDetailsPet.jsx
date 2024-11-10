import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Spinner from "../Spinner";
import PetRecords from "./records/PetRecords";

export default function OwnerAdoptionsDetailsPet() {
  const { petId, id } = useParams();
  const [petData, setPetData] = useState(null);

  // Fetch pet details from Firestore
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petRef = doc(db, "pets", petId);
        const petDoc = await getDoc(petRef);
        if (petDoc.exists()) {
          setPetData(petDoc.data());
        } else {
          console.error("No pet found with the given ID.");
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      }
    };
    fetchPetData();
  }, [petId]);

  useEffect(() => {
    fetchPetData();
  }, [petId]);

    // Fetch pet details from Firestore
    const fetchPetData = async () => {
      try {
        const petRef = doc(db, "pets", petId);
        const petDoc = await getDoc(petRef);
        if (petDoc.exists()) {
          setPetData(petDoc.data());
        } else {
          console.error("No pet found with the given ID.");
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      }
    };

    

  if (!petData) {
    return <Spinner />;
  }

  const {
    image,
    petName,
    birthdate,
    species,
    breed,
    gender,
    weight,
    color,
    existingConditions,
  } = petData;

  // Calculate age based on birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return "Not specified";
    const birthDateObj = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(birthdate);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center">
          <img
            src={image || "https://via.placeholder.com/100"} // Use pet's image or a placeholder
            alt={petName}
            className="rounded-full w-24 h-24 mr-4 object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold">{petName}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-semibold">Pet Information</h3>
            <ul className="text-gray-700">
              <li><strong>Age:</strong> {age} years</li>
              <li><strong>Birth Date:</strong> {birthdate || "Not specified"}</li>
              <li><strong>Species:</strong> {species}</li>
              <li><strong>Breed:</strong> {breed}</li>
              <li><strong>Gender:</strong> {gender}</li>
              <li><strong>Weight:</strong> {weight} kg</li>
              <li><strong>Color:</strong> {color}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Health Concerns</h3>
            <ul className="text-gray-700">
              <li><strong>Allergies:</strong> None</li> {/* Add allergies if available */}
              <li><strong>Existing Conditions:</strong> {existingConditions || "None"}</li>
            </ul>
          </div>
        </div>
      </div>


      <PetRecords petUid={petId} projectId={id} />
    </>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Make sure this is your Firebase configuration
import { FaFileDownload } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";

export default function ProjectAdoptionInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);

  useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        const petRef = doc(getFirestore(), "adoptions", id);
        const petSnap = await getDoc(petRef);

        if (petSnap.exists()) {
          setPet(petSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching pet details:", error);
      }
    };

    fetchPetDetails();
  }, [id]);

  if (!pet) {
    return <div>Loading...</div>;
  }

  // Format birthdate to show age
  const calculateAge = (birthdate) => {
    const birthDateObj = new Date(birthdate);
    const diff = Date.now() - birthDateObj.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970); // Calculate age in years
  };

  return (
    <div className="min-h-screen bg-pink-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 md:flex">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm mb-4 md:mb-0"
        >
          &lt; BACK
        </button>

        {/* Image Section */}
        <div className="md:w-1/3 flex justify-center md:justify-start">
          <img
            src={pet.image}
            alt={pet.petName}
            className="rounded-full w-48 h-48 object-cover border-4 border-white shadow-md"
          />
        </div>

        {/* Pet Details Section */}
        <div className="md:w-2/3 md:ml-6">
          <h2 className="text-3xl font-bold text-red-600">{pet.petName}</h2>
          <p className="text-gray-700 mt-2">
            <span className="font-bold">Gender: </span>
            {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Age: </span>
            {calculateAge(pet.birthdate)} years old
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Color: </span>
            {pet.color.charAt(0).toUpperCase() + pet.color.slice(1)}
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Breed: </span>
            {pet.breed}
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Weight: </span>
            {pet.weight} kg
          </p>
          <p className="text-gray-700 mt-4">{pet.notes}</p>

          {/* Buttons Section with Spacing */}
          <div className="flex space-x-4 mt-6">
            {/* Adoption Inquiry Button */}
            <button className="btn btn-primary">
              <AiFillMessage className="mr-2" /> ADOPTION INQUIRY
            </button>

            {/* Download Adoption Form Button */}
            <button className="btn btn-primary">
              <FaFileDownload className="mr-2" /> DOWNLOAD ADOPTION FORM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

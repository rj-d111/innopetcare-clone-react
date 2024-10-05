import React from "react";

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

const PetInformation = ({ pet }) => {
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
  } = pet;

  const age = calculateAge(birthdate);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center">
        <img
          src={image || "https://via.placeholder.com/100"} // Use the pet's image or a placeholder
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
            <li>Age: {age}</li>
            <li>Birth Date: {birthdate}</li>
            <li>Species: {species}</li>
            <li>Breed: {breed}</li>
            <li>Gender: {gender}</li>
            <li>Weight: {weight} kg</li>
            <li>Color: {color}</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Health Concerns</h3>
          <ul className="text-gray-700">
            <li>Allergies: None</li> {/* Add allergies if available */}
            <li>Existing Conditions: {existingConditions || "None"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PetInformation;

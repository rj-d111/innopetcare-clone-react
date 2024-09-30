import React from 'react'

const PetInformation = () => {
    return (
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center">
          <img
            src="https://via.placeholder.com/100"
            alt="Pet"
            className="rounded-full w-24 h-24 mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold">Cooper</h2>
            <p className="text-gray-500">Pet Record No: 0034</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-semibold">Pet Information</h3>
            <ul className="text-gray-700">
              <li>Age: 1</li>
              <li>Birth Date: 12/18/2023</li>
              <li>Species: Dog</li>
              <li>Breed: Corgi</li>
              <li>Gender: Male</li>
              <li>Weight: 11.5 kg</li>
              <li>Color: Fawn</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Health Concerns</h3>
            <ul className="text-gray-700">
              <li>Allergies: None</li>
              <li>Existing Conditions: None</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  export default PetInformation;
  
import React from 'react'

const OwnerInformation = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
        <h3 className="text-xl font-bold mb-4">Pet Owner Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Name:</p>
            <p>Jeffrey Dela Cruz</p>
          </div>
          <div>
            <p className="font-semibold">Email:</p>
            <p>jeffrey@example.com</p>
          </div>
          <div>
            <p className="font-semibold">Contact No:</p>
            <p>0916827304</p>
          </div>
          <div>
            <p className="font-semibold">Address:</p>
            <p>B9 L4 Camella Cerritos 1 Bacoor, Cavite</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default OwnerInformation;
  
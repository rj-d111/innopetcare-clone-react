import React from 'react'

const PetRecords = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
        <div className="tabs">
          <p className="tab tab-bordered">Vaccination</p>
          <p className="tab tab-bordered">Deworming</p>
          <p className="tab tab-bordered">Services</p>
          <p className="tab tab-bordered">Medical History</p>
          <p className="tab tab-bordered">Recent Record</p>
        </div>
        <div className="mt-4">
          {/* Table for Vaccination Records */}
          <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Due</th>
                <th>Weight (kg)</th>
                <th>Against</th>
                <th>Manufacturer</th>
                <th>Veterinarian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>5/02/23</td>
                <td>5/10/24</td>
                <td>11.0</td>
                <td>Rabies</td>
                <td>RABIAN</td>
                <td>Dr. Fortunato Hernandez</td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default PetRecords;
  
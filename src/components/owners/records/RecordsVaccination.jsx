import React from 'react'

export default function RecordsVaccination() {
  return (
    <div>
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
  )
}

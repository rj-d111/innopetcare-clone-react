import React from 'react'

export default function RecordsMedicalHistory() {
  return (
    <div>
      {/* Table for Medical History */}
      <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Diagnosis</th>
                <th>Notes</th>
                <th>Prescribed Action</th>
                <th>Prescribed Medication</th>
                <th>Test Performed</th>
                <th>Test Results</th>
                <th>Veterinarian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>5/02/23</td>
                <td>___</td>
                <td>___</td>
                <td>___</td>
                <td>___</td>
                <td>___</td>
                <td>___</td>
                <td>___</td>
                <td>Dr. Fortunato Hernandez</td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
    </div>
  )
}

import React from 'react'

export default function RecordsServices() {
  return (
    <div>
              {/* Table for Vaccination Records */}
              <table className="table w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Veterinarian</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>5/02/23</td>
                <td>5/10/24</td>
                <td>Miguel</td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
    </div>
  )
}

import React, { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import OwnerAdoptionModal from "./OwnerAdoptionModal"; // Import the modal

export default function OwnerAdoption() {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [clientName] = useState("John Doe"); // Example client name, replace with dynamic data
  const [clientId] = useState("123456"); // Example client ID
  const [projectId] = useState("654321"); // Example project ID

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="font-semibold text-4xl mb-4">Owner Adoption</h1>

      {/* Button to open the modal */}
      <button
        className="btn btn-success btn-sm text-white"
        onClick={openModal} // Open modal on button click
      >
        <IoIosAddCircleOutline /> Add Pets
      </button>

      {/* Render the modal */}
      {isModalOpen && (
        <OwnerAdoptionModal
          clientId={clientId}
          projectId={projectId}
          clientName={clientName}
          closeModal={closeModal} // Pass closeModal to allow modal closure
        />
      )}

      {/* Table data */}
      <div className="overflow-x-auto mt-4">
        <table className="table">
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Name</th>
              <th>Job</th>
              <th>Favorite Color</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* Example rows - replace with your dynamic data */}
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle h-12 w-12">
                      <img
                        src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                        alt="Avatar Tailwind CSS Component"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">Hart Hagerty</div>
                    <div className="text-sm opacity-50">United States</div>
                  </div>
                </div>
              </td>
              <td>
                Zemlak, Daniel and Leannon
                <br />
                <span className="badge badge-ghost badge-sm">
                  Desktop Support Technician
                </span>
              </td>
              <td>Purple</td>
              <th>
                <button className="btn btn-ghost btn-xs">details</button>
              </th>
            </tr>
            {/* Add more rows dynamically */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

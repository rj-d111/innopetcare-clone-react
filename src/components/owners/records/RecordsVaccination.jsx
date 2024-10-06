import React, { useEffect, useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
import { useParams } from "react-router";
import ModalVaccination from "./ModalVaccination";
import { collection, query, where, getDocs } from "firebase/firestore";
import {db} from "../../../firebase"; // Assuming Firebase is initialized in this file

export default function RecordsVaccination({ petId }) {
  const projectId = useParams().id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchVaccinationRecords = async () => {
      try {
        const q = query(
          collection(db, "records-vaccination"),
          where("projectId", "==", projectId),
          where("petId", "==", petId)
        );
        
        const querySnapshot = await getDocs(q);
        const recordsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setVaccinationRecords(recordsArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vaccination records:", error);
        setLoading(false);
      }
    };

    fetchVaccinationRecords();
  }, [projectId, petId, db]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Button to open the modal */}
      <button
        className="btn btn-success btn-sm text-white"
        onClick={() => setIsModalOpen(true)}
      >
        <IoIosAddCircleOutline /> Add Record
      </button>

      {/* Modal for adding records */}
      <ModalVaccination
        petId={petId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* Table for Vaccination Records */}
      {loading ? (
        <p>Loading...</p>
      ) : vaccinationRecords.length > 0 ? (
        <table className="table w-full mt-4">
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
            {vaccinationRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.date}</td>
                <td>{record.due}</td>
                <td>{record.weight}</td>
                <td>{record.against}</td>
                <td>{record.manufacturer}</td>
                <td>{record.veterinarian}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No vaccination data here</p>
      )}
    </div>
  );
}

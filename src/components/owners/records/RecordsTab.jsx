import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import RecordsTabModal from "./RecordsTabModal";

export default function RecordsTab({ projectId, sectionId, petId }) {
  const [records, setRecords] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Fetch records from Firestore
  const fetchRecords = async () => {
    const recordsRef = collection(db, `pet-health-records`);
    const snapshot = await getDocs(recordsRef);
    const fetchedRecords = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRecords(fetchedRecords);
  };

  useEffect(() => {
    fetchRecords();
  }, [projectId, sectionId]);

  // Delete record
  const handleDeleteRecord = async () => {
    const recordDocRef = doc(db, `pet-health-records`, recordToDelete);
    await deleteDoc(recordDocRef);
    setRecordToDelete(null);
    setShowDeleteModal(false);
    fetchRecords();
  };

  return (
    <div>
      {/* Add Record Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="btn btn-primary mb-4"
      >
        Add Record
      </button>

      {/* Add Record Modal */}
      {showAddModal && (
        <RecordsTabModal
          projectId={projectId}
          sectionId={sectionId}
          petId={petId}
          onClose={() => setShowAddModal(false)}
          onRecordAdded={fetchRecords}
        />
      )}

      {/* Table Display */}
      <table className="table-auto w-full mt-4">
  <thead>
    <tr>
      <th className="text-xs font-semibold">Date</th>
      <th className="text-xs font-semibold">Description</th>
      <th className="text-xs font-semibold">Diagnosis</th>
      <th className="text-xs font-semibold">Test Performed</th>
      <th className="text-xs font-semibold">Test Results</th>
      <th className="text-xs font-semibold">Prescribed Action</th>
      <th className="text-xs font-semibold">Prescribed Medication</th>
      <th className="text-xs font-semibold">Veterinarian</th>
      <th className="text-xs font-semibold">Notes</th>
      <th className="text-xs font-semibold">Actions</th>
    </tr>
  </thead>
  <tbody>
    {records.length > 0 ? (
      records.map((record) => (
        <tr key={record.id} className="border-b">
          <td className="text-xs p-2">{record.date}</td>
          <td className="text-xs p-2">{record.description}</td>
          <td className="text-xs p-2">{record.diagnosis}</td>
          <td className="text-xs p-2">{record.testPerformed}</td>
          <td className="text-xs p-2">{record.testResults}</td>
          <td className="text-xs p-2">{record.prescribedAction}</td>
          <td className="text-xs p-2">{record.prescribedMedication}</td>
          <td className="text-xs p-2">{record.veterinarian}</td>
          <td className="text-xs p-2">{record.notes}</td>
          <td className="text-xs p-2">
            <button className="text-xs btn btn-sm mr-2">Edit</button>
            <button className="text-xs btn btn-sm text-red-600">Delete</button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="10" className="text-center text-xs p-4">
          No Records
        </td>
      </tr>
    )}
  </tbody>
</table>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Are you sure you want to delete this record?</h2>
            <p>This action will permanently delete the record.</p>
            <button onClick={handleDeleteRecord} className="btn btn-danger">
              Yes, Delete
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

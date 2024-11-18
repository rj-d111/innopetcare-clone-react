import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import Spinner from "../../Spinner";
import { toast } from "react-toastify";

export default function RecordsTabModal({
  projectId,
  sectionId,
  petId,
  onClose,
  onRecordAdded,
  existingRecord,
}) {
  const [columns, setColumns] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch columns for the selected section
  const fetchColumns = async () => {
    try {
      const columnsRef = collection(
        db,
        "pet-health-sections",
        projectId,
        "sections",
        sectionId,
        "columns"
      );
      const columnsSnapshot = await getDocs(
        query(columnsRef, orderBy("columnCreated", "asc"))
      );
      const fetchedColumns = columnsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setColumns(fetchedColumns);
    } catch (error) {
      console.error("Error fetching columns:", error);
      toast.error("Error fetching columns");
    }
  };

  // Fetch columns on component mount
  useEffect(() => {
    if (projectId && sectionId) {
      fetchColumns();
    }

    // Pre-fill the form if editing
    if (existingRecord) {
      setFormData(existingRecord.records);
    }
  }, [projectId, sectionId]);

  // Handle form input changes
  const handleInputChange = (columnId, value) => {
    setFormData({ ...formData, [columnId]: value });
  };

  // Handle saving the record to Firestore
  const handleSaveRecord = async () => {
    setLoading(true);
    try {
      // Reference to the records collection
      const recordsRef = collection(
        db,
        "pet-health-records",
        projectId,
        petId,
        sectionId,
        "records"
      );

      // Prepare data to be saved
      const recordData = {
        records: { ...formData },
        recordCreated: serverTimestamp(),
      };

      // Add the record to Firestore
      await addDoc(recordsRef, recordData);

      toast.success("Record added successfully!");
      onRecordAdded();
      onClose();
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Failed to save record");
    } finally {
      setLoading(false);
    }
  };

   // Handle updating an existing record in Firestore
   const handleUpdateRecord = async () => {
    setLoading(true);
    try {
      // Reference to the specific record to update
      const recordRef = doc(
        db,
        "pet-health-records",
        projectId,
        petId,
        sectionId,
        "records",
        existingRecord.id
      );

      // Prepare data to be updated (do not update recordCreated)
      const updatedRecordData = {
        records: formData,
      };

      await updateDoc(recordRef, updatedRecordData);

      toast.success("Record updated successfully!");
      onRecordAdded();
      onClose();
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md w-11/12 max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-4">{existingRecord ? "Edit Record" : "Add New Record"}</h2>

        {loading && <Spinner />}

        {/* Form Fields */}
        {!loading && (
          <>
            <div className="flex flex-col gap-4">
              {columns.map((column) => (
                <div key={column.id} className="flex flex-col">
                  <label className="text-sm font-medium">{column.name}</label>
                  {column.type === "text" && (
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder={`Enter ${column.name}`}
                      value={formData[column.id] || ""}
                      onChange={(e) =>
                        handleInputChange(column.id, e.target.value)
                      }
                    />
                  )}
                  {column.type === "date" && (
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={formData[column.id] || ""}
                      onChange={(e) =>
                        handleInputChange(column.id, e.target.value)
                      }
                    />
                  )}
                  {column.type === "number" && (
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      placeholder={`Enter ${column.name}`}
                      value={formData[column.id] || ""}
                      onChange={(e) =>
                        handleInputChange(column.id, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={existingRecord ? handleUpdateRecord : handleSaveRecord}
                disabled={loading}
              >
                {loading ? <Spinner /> : existingRecord ? "Update Record" : "Save Record"}              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

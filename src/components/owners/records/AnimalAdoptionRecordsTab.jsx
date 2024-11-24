import React, { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { toast } from "react-toastify";
import RecordsTabModal from "./RecordsTabModal";
import { FaPencilAlt, FaPrint, FaTrash } from "react-icons/fa";
import AnimalAdoptionRecordsTabModal from "./AnimalAdoptionRecordsTabModal";

export default function AnimalAdoptionRecordsTab({
  projectId,
  sectionId,
  petId,
  isClient,
}) {
  const [records, setRecords] = useState([]);
  const [sections, setSections] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState(null); // New state for selected record
  // Fetch sections and columns from Firebase
  const fetchSectionsAndColumns = async () => {
    try {
      if (!projectId) return;

      const sectionsRef = collection(
        db,
        "adoption-record-sections",
        projectId,
        "sections"
      );
      const sectionsSnapshot = await getDocs(sectionsRef);
      const fetchedSections = [];

      for (const sectionDoc of sectionsSnapshot.docs) {
        const sectionData = sectionDoc.data();
        const sectionId = sectionDoc.id;

        // Fetch columns for each section
        const columnsRef = collection(
          db,
          "adoption-record-sections",
          projectId,
          "sections",
          sectionId,
          "columns"
        );
        const columnsSnapshot = await getDocs(
          query(columnsRef, orderBy("columnCreated", "asc"))
        );

        const fetchedColumns = columnsSnapshot.docs.map((colDoc) => ({
          id: colDoc.id,
          ...colDoc.data(),
        }));

        fetchedSections.push({
          id: sectionId,
          ...sectionData,
          columns: fetchedColumns,
        });
      }
      setSections(fetchedSections);
    } catch (error) {
      console.error("Error fetching sections and columns:", error);
    }
  };

  // Fetch records based on the new data structure
  // Fetch records based on the new data structure
  const fetchRecords = async () => {
    try {
      if (!projectId || !petId) return;

      let fetchedRecords = [];

      if (sectionId === "recent-record") {
        // Fetch only the most recent records based on the recordCreated attribute
        for (const section of sections) {
          const recordsRef = collection(
            db,
            `adoption-records/${projectId}/${petId}/${section.id}/records`
          );
          const snapshot = await getDocs(
            query(recordsRef, orderBy("recordCreated", "desc"), limit(1))
          );

          const recentRecords = snapshot.docs.map((doc) => ({
            id: doc.id,
            sectionId: section.id,
            ...doc.data(),
          }));

          fetchedRecords = [...fetchedRecords, ...recentRecords];
        }
      } else if (sectionId === "all") {
        // Fetch records for all sections
        for (const section of sections) {
          const recordsRef = collection(
            db,
            `adoption-records/${projectId}/${petId}/${section.id}/records`
          );
          const snapshot = await getDocs(recordsRef);

          const sectionRecords = snapshot.docs.map((doc) => ({
            id: doc.id,
            sectionId: section.id,
            ...doc.data(),
          }));
          fetchedRecords = [...fetchedRecords, ...sectionRecords];
        }
      } else {
        // Fetch records for a specific section
        const recordsRef = collection(
          db,
          `adoption-records/${projectId}/${petId}/${sectionId}/records`
        );
        const snapshot = await getDocs(recordsRef);

        fetchedRecords = snapshot.docs.map((doc) => ({
          id: doc.id,
          sectionId,
          ...doc.data(),
        }));
      }

      setRecords(fetchedRecords);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Failed to fetch records");
    }
  };

  // Function to delete a record
  const handleDeleteRecord = async (record) => {
    try {
      if (!projectId || !petId || !record.sectionId || !record.id) {
        toast.error("Invalid record data. Unable to delete.");
        return;
      }

      // Reference to the record in Firestore
      const recordRef = doc(
        db,
        `adoption-records/${projectId}/${petId}/${record.sectionId}/records`,
        record.id
      );

      // Confirm deletion
      if (window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
        await deleteDoc(recordRef);

        // Refresh records after deletion
        fetchRecords();

        toast.success("Record deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record.");
    }
  };

  useEffect(() => {
    fetchSectionsAndColumns();
    fetchRecords();
  }, [projectId, sectionId, petId]);

  // Open modal for editing
  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setShowAddModal(true);
  };

  return (
    <div>
      {/* Add Record Button */}
      {sectionId !== "all" &&
        sectionId !== "recent-record" &&
        sectionId !== "medical-history" &&
        !isClient && (
          <button
            onClick={() => {
              setShowAddModal(true);
              setSelectedSection(sectionId);
              setSelectedRecord(null); // Reset existingRecord to null
            }}
            className="btn btn-primary mb-4 print:hidden"
          >
            + Add Record
          </button>
        )}

      {/* Display Records */}
      {sections.map((section) => {
        // Filter records that have at least one non-empty value for this section's columns
        const filteredRecords = records.filter((record) =>
          section.columns.some((column) => record.records?.[column.id])
        );

        // If there are no filtered records, skip rendering this section
        if (filteredRecords.length === 0) return null;

        return (
          <div key={section.id} className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{section.name}</h3>
            <div className="overflow-x-auto">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    {section.columns.map((column) => (
                      <th
                        key={column.id}
                        className="px-4 py-2 border border-gray-300 text-left"
                      >
                        {column.name}
                      </th>
                    ))}
                    {!isClient && (
                      <th className="px-4 py-2 border border-gray-300 text-left print:hidden">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id}>
                      {section.columns.map((column) => (
                        <td
                          key={column.id}
                          className="px-4 py-2 border border-gray-300"
                        >
                          {record.records?.[column.id] || "-"}
                        </td>
                      ))}
                      {!isClient && (
                        <td className="px-4 py-2 border border-gray-300 print:hidden">
                          <button
                            className="btn btn-sm text-xs bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                            onClick={() => handleEditRecord(record)}
                          >
                            <FaPencilAlt /> Edit
                          </button>
                          <button
                            className="btn btn-sm text-xs bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
                            onClick={() => handleDeleteRecord(record)}
                          >
                            <FaTrash /> <span className="text-[0.7rem]">Delete</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* RecordsTabModal for adding a new record */}
      {showAddModal && (
        <AnimalAdoptionRecordsTabModal
          projectId={projectId}
          sectionId={selectedSection}
          petId={petId}
          onClose={() => setShowAddModal(false)}
          onRecordAdded={fetchRecords}
          existingRecord={selectedRecord} // Pass the selected record
        />
      )}
    </div>
  );
}

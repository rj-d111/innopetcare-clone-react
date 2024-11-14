import React, { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";
import { toast } from "react-toastify";
import RecordsTabModal from "./RecordsTabModal";
import { FaPrint } from "react-icons/fa";

export default function RecordsTab({ projectId, sectionId, petId }) {
  const [records, setRecords] = useState([]);
  const [sections, setSections] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState("all");

  // Fetch sections and columns from Firebase
  const fetchSectionsAndColumns = async () => {
    try {
      if (!projectId) return;

      const sectionsRef = collection(
        db,
        "pet-health-sections",
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
          "pet-health-sections",
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
  const fetchRecords = async () => {
    try {
      if (!projectId || !petId) return;

      let fetchedRecords = [];

      if (sectionId === "all") {
        // Fetch records for all sections
        for (const section of sections) {
          const recordsRef = collection(
            db,
            `pet-health-records/${projectId}/${petId}/${section.id}/records`
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
          `pet-health-records/${projectId}/${petId}/${sectionId}/records`
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

  useEffect(() => {
    fetchSectionsAndColumns();
    fetchRecords();
  }, [projectId, sectionId, petId]);

  return (
    <div>
      {/* Add Record Button */}
      {sectionId !== "all" &&
        sectionId !== "recent-record" &&
        sectionId !== "medical-history" && (
          <button
            onClick={() => {
              setShowAddModal(true);
              setSelectedSection(sectionId);
            }}
            className="btn btn-primary mb-4"
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
                    <th className="px-4 py-2 border border-gray-300 text-left print:hidden">
                      Actions
                    </th>
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
                      <td className="px-4 py-2 border border-gray-300 print:hidden">
                        <button className="text-xs btn btn-sm">Edit</button>
                        <button className="text-xs btn btn-sm text-red-600">
                          Delete
                        </button>
                      </td>
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
        <RecordsTabModal
          projectId={projectId}
          sectionId={selectedSection}
          petId={petId}
          onClose={() => setShowAddModal(false)}
          onRecordAdded={fetchRecords}
        />
      )}
    </div>
  );
}

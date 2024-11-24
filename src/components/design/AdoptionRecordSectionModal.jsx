import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  serverTimestamp,
  collection,
  query,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router";
import { FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function AdoptionRecordSectionModal({
  projectId,
  closeModal,
  onSectionAddedOrEdited,
  selectedSection,
}) {
  const [sectionName, setSectionName] = useState("");
  const [activeTab, setActiveTab] = useState("input-name");
  const [isEditing, setIsEditing] = useState(false);

  console.log(selectedSection);
  // State for columns
  const [columns, setColumns] = useState([
    { name: "", type: "text", sample: "" },
  ]);

  // Populate fields when editing
  useEffect(() => {
    if (selectedSection) {
      setSectionName(selectedSection.name);
      setIsEditing(true);
    }
  }, [selectedSection]);

  // Populate fields and columns when editing
  useEffect(() => {
    const fetchSectionColumns = async () => {
      if (selectedSection && projectId) {
        // Clear columns state before fetching new data
        setColumns([]);

        setSectionName(selectedSection.name);
        setIsEditing(true);

        try {
          // Define the collection reference with sorting
          const columnsRef = collection(
            db,
            "adoption-record-sections",
            projectId,
            "sections",
            selectedSection.id,
            "columns"
          );

          // Add orderBy to sort by columnCreated in ascending order
          const columnsQuery = query(
            columnsRef,
            orderBy("columnCreated", "asc")
          );
          const columnsSnapshot = await getDocs(columnsQuery);

          if (!columnsSnapshot.empty) {
            // Map the fetched columns into the state
            const fetchedColumns = columnsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setColumns(fetchedColumns);
          }
        } catch (error) {
          console.error("Error fetching columns:", error);
          toast.error("Error fetching columns");
        }
      }
    };

    // Fetch columns only if a section is selected
    if (selectedSection) {
      fetchSectionColumns();
    } else {
      // Clear the state when no section is selected
      setColumns([]);
      setSectionName("");
      setIsEditing(false);
    }
  }, [selectedSection, projectId]);

  // Handle adding a new column
  const addColumn = () => {
    setColumns([...columns, { name: "", type: "text", sample: "" }]);
  };

  // Handle changing column values
  const handleColumnChange = (index, key, value) => {
    const updatedColumns = [...columns];
    updatedColumns[index][key] = value;
    setColumns(updatedColumns);
  };

  const handleDeleteColumn = (index) => {
    const trimmedName = columns[index]?.name?.trim();
  
    // If the column name is empty, delete it directly without confirmation
    if (!trimmedName) {
      deleteColumn(index);
      return;
    }
  
    // Show confirmation dialog for non-empty column names
    const confirmation = window.confirm(
      `Are you sure you want to delete "${trimmedName}"? All your data will be lost. Be careful, this action cannot be undone.`
    );
  
    if (confirmation) {
      deleteColumn(index);
    }
  };
  

  const deleteColumn = async (index) => {
    const columnToDelete = columns[index];

    // If the column has an ID, it means it exists in Firestore
    if (columnToDelete.id) {
      try {
        const columnRef = doc(
          db,
          "adoption-record-sections",
          projectId,
          "sections",
          selectedSection.id,
          "columns",
          columnToDelete.id
        );
        await deleteDoc(columnRef);
        toast.success("Column deleted successfully");
      } catch (error) {
        console.error("Error deleting column:", error);
        toast.error("Error deleting column");
      }
    }

    // Remove column from the state
    const updatedColumns = columns.filter((_, i) => i !== index);
    setColumns(updatedColumns);
  };

  // Handle saving the section
  const handleSave = async () => {
    const trimmedName = sectionName.trim();
    if (!trimmedName) {
      toast.error("Please provide a section name!");
      return;
    }
  
    // Filter out columns with empty names or types
    const filteredColumns = columns.filter(
      (col) => col.name.trim() !== "" && col.type !== ""
    );
  
    if (filteredColumns.length === 0) {
      toast.error("Please add at least one valid column.");
      return;
    }
  
    try {
      const sectionsRef = collection(
        db,
        "adoption-record-sections",
        projectId,
        "sections"
      );
      let sectionId;
  
      // Update section if editing, otherwise create a new one
      if (isEditing && selectedSection?.id) {
        sectionId = selectedSection.id;
        await setDoc(doc(sectionsRef, sectionId), {
          name: trimmedName,
          sectionCreated: serverTimestamp(),
        });
      } else {
        const newSectionDoc = await addDoc(sectionsRef, {
          name: trimmedName,
          sectionCreated: serverTimestamp(),
        });
        sectionId = newSectionDoc.id;
      }
  
      // Reference to the columns collection
      const columnsRef = collection(
        db,
        "adoption-record-sections",
        projectId,
        "sections",
        sectionId,
        "columns"
      );
  
      // Loop through the columns and update or add them accordingly
      await Promise.all(
        filteredColumns.map(async (column) => {
          if (column.id) {
            // If column has an ID, update it
            const columnDocRef = doc(columnsRef, column.id);
            await setDoc(columnDocRef, {
              name: column.name.trim(),
              type: column.type,
              columnCreated: column.columnCreated || serverTimestamp(),
            });
          } else {
            // If column is new, add it
            await addDoc(columnsRef, {
              name: column.name.trim(),
              type: column.type,
              columnCreated: serverTimestamp(),
            });
          }
        })
      );
  
      toast.success("Section saved successfully");
      onSectionAddedOrEdited();
      closeModal();
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Error saving section");
    }
  };
  

  const swapColumns = async (index1, index2) => {
    const updatedColumns = [...columns];
  
    // Swap the columns in the state
    const temp = updatedColumns[index1];
    updatedColumns[index1] = updatedColumns[index2];
    updatedColumns[index2] = temp;
  
    // Swap the columnCreated timestamps
    const tempCreated = updatedColumns[index1].columnCreated;
    updatedColumns[index1].columnCreated = updatedColumns[index2].columnCreated;
    updatedColumns[index2].columnCreated = tempCreated;
  
    // Update the columns state
    setColumns(updatedColumns);
  
    // Update Firebase with the swapped timestamps
    try {
      const columnRef1 = doc(
        db,
        "adoption-record-sections",
        projectId,
        "sections",
        selectedSection.id,
        "columns",
        updatedColumns[index1].id
      );
      const columnRef2 = doc(
        db,
        "adoption-record-sections",
        projectId,
        "sections",
        selectedSection.id,
        "columns",
        updatedColumns[index2].id
      );
  
      // Update the columnCreated fields in Firebase
      await updateDoc(columnRef1, {
        columnCreated: updatedColumns[index1].columnCreated,
      });
      await updateDoc(columnRef2, {
        columnCreated: updatedColumns[index2].columnCreated,
      });
  
      toast.success("Columns reordered successfully");
    } catch (error) {
      console.error("Error updating column order in Firebase:", error);
      // toast.error("Failed to update column order");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md w-full max-w-7xl p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-semibold mb-4">
          {isEditing
            ? "Edit Adoption Record Section"
            : "Add New Adoption Record Section"}
        </h2>

        {/* Main Container for Form and Preview */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Input Form */}
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <label
                htmlFor="sectionName"
                className="block text-sm font-medium text-gray-700"
              >
                Section Name (Ex.  Animal Intake, Animal Health Checkup, Surrender Records)
              </label>
              <input
                id="sectionName"
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="input input-bordered input-warning w-full"
                placeholder="Enter section name"
              />
            </div>

            {/* Add Columns Section */}
            <h3 className="font-semibold text-lg mb-2">Add Columns</h3>
            <div className="max-h-[30vh] overflow-y-auto">
              {columns.map((column, index) => (
                <div key={index} className="flex items-center gap-4 mb-4">
                  {/* Column Name Input */}
                  <input
                    type="text"
                    value={column.name}
                    onChange={(e) =>
                      handleColumnChange(index, "name", e.target.value)
                    }
                    placeholder="Column Name"
                    className="input input-bordered w-full"
                  />
                  {/* Column Type Dropdown */}
                  <select
                    value={column.type}
                    onChange={(e) =>
                      handleColumnChange(index, "type", e.target.value)
                    }
                    className="select select-bordered"
                  >
                    <option value="">Select Type</option>
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                  </select>
                  {/* Sample Input Field */}
                  {/* <input
                    type={column.type || "text"}
                    value={column.sample}
                    onChange={(e) =>
                      handleColumnChange(index, "sample", e.target.value)
                    }
                    placeholder={`Sample (${column.type || "text"})`}
                    className="input input-bordered w-full"
                    disabled={!column.type}
                  /> */}
                  {/* Up Arrow (disabled for the first column) */}
                  {index > 0 && (
                    <FaArrowUp
                      className="text-gray-600 cursor-pointer"
                      size={30}
                      onClick={() => swapColumns(index, index - 1)}
                    />
                  )}
                  {/* Down Arrow (disabled for the last column) */}
                  {index < columns.length - 1 && (
                    <FaArrowDown
                      className="text-gray-600 cursor-pointer"
                      size={30}
                      onClick={() => swapColumns(index, index + 1)}
                    />
                  )}
                  {/* Trash Icon for Deleting Column */}
                  <FaTrash
                    className="text-red-500 cursor-pointer"
                    size={30}
                    onClick={() => handleDeleteColumn(index)}
                  />
                </div>
              ))}
            </div>

            {/* Add New Column Button */}
            <button
              type="button"
              className="btn btn-outline btn-primary w-full mt-4"
              onClick={addColumn}
            >
              + Add Columns
            </button>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
                onClick={handleSave}
              >
                {isEditing ? "Save Changes" : "Add Section"}
              </button>
            </div>
          </div>

          {/* Right Column: Preview Section */}
          <div className="w-full md:w-1/2">
            <h1 className="font-semibold text-lg mb-2">Preview</h1>
            <div className="mockup-window border border-base-300 overflow-auto max-h-[40vh]">
              <div className="border-t border-base-300 px-4 py-6 overflow-x-auto">
                {/* Stunning Header Title */}
                <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
                {sectionName.trim() !== "" ? sectionName : "Insert Section Name Here"}
                    </h2>
                <table className="table-auto w-full border-collapse border border-gray-300 text-xs">
                  {/* Column Names Row */}
                  <thead className="bg-gray-100">
                    <tr>
                      {columns.length > 0 ? (
                        columns.map((column, index) => (
                          <th
                            key={index}
                            className="px-4 py-2 border border-gray-300 text-left"
                          >
                            {column.name || ""}
                          </th>
                        ))
                      ) : (
                        <th className="px-4 py-2 border border-gray-300 text-left">
                          Please insert data in the columns section
                        </th>
                      )}
                    </tr>
                  </thead>
                  {/* Sample Data Row */}
                  <tbody>
                    <tr className="bg-white">
                      {columns.map((column, index) => (
                        <td
                          key={index}
                          className="px-4 py-2 border border-gray-300"
                        >
                          {column.sample || "-"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

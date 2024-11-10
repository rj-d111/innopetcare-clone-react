import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { serverTimestamp, collection, query, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router";

export default function PetHealthRecordsSectionModal({
  closeModal,
  onSectionAddedOrEdited,
  selectedSection,
}) {
  const { id } = useParams();
  const [sectionName, setSectionName] = useState("");
  const [activeTab, setActiveTab] = useState("medical-history"); // Default tab
  const [isEditing, setIsEditing] = useState(false);

  // If editing, populate the fields with the selected section data
  useEffect(() => {
    if (selectedSection) {
      setSectionName(selectedSection.name);
      setIsEditing(true);
    }
  }, [selectedSection]);

  // Handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle saving a new or edited section
  const handleSave = async () => {
    // Trim the section name before any validation
    const trimmedName = sectionName.trim();
  
    if (!trimmedName) {
      toast.error("Please provide a section name!");
      return;
    }
  
    try {
      // Check for duplicates before saving
      const isDuplicate = await checkForDuplicates(trimmedName);
  
      if (isDuplicate && !isEditing) {
        toast.error("A section with this name already exists!");
        return;
      }
  
      const sectionsRef = collection(db, "pet-health-sections", id, "sections");
  
      if (isEditing) {
        // Update existing section
        await setDoc(doc(sectionsRef, selectedSection.id), {
          name: trimmedName,
        });
        toast.success("Section updated successfully");
      } else {
        // Add a new section with current timestamp
        await setDoc(doc(sectionsRef), {
          name: trimmedName,
          sectionCreated: serverTimestamp(),
        });
        toast.success("Section added successfully");
      }
  
      onSectionAddedOrEdited(); // Refresh sections after saving
      closeModal();
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Error saving section");
    }
  };

  const checkForDuplicates = async (name) => {
    const sectionsRef = collection(db, "pet-health-sections", id, "sections");
    const q = query(sectionsRef);
    const querySnapshot = await getDocs(q);

    // Check if any section has the same name (case-insensitive)
    const duplicate = querySnapshot.docs.some(
      (doc) => doc.data().name.toLowerCase() === name.toLowerCase()
    );

    return duplicate;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md w-8/10 p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {isEditing
            ? "Edit Health Record Section"
            : "Add New Health Record Section"}
        </h2>

        <div className="mb-4">
          <label
            htmlFor="sectionName"
            className="block text-sm font-medium text-gray-700"
          >
            Section Name (Ex. Vaccination, Deworming, Rabies)
          </label>
          <input
            id="sectionName"
            type="text"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            className="input input-bordered input-warning w-full max-w-xs"
            placeholder="Enter section name"
          />
        </div>

        {/* Tabbed Preview Section */}
        <h1 className="font-semibold text-lg">Preview</h1>
        <div className="mockup-window border-base-300 border">
          <div className="border-base-300 flex justify-center border-t px-4 py-16">
            <div className="flex-col">
              <div role="tablist" className="tabs tabs-boxed">
                <a
                  role="tab"
                  className={`tab ${
                    activeTab === "recent-records" ? "tab-active" : ""
                  }`}
                  onClick={() => handleTabChange("recent-records")}
                >
                  Recent Records
                </a>
                <a
                  role="tab"
                  className={`tab ${
                    activeTab === "medical-history" ? "tab-active" : ""
                  }`}
                  onClick={() => handleTabChange("medical-history")}
                >
                  Medical History
                </a>
                <a
                  role="tab"
                  className={`tab ${
                    activeTab === "input-name" ? "tab-active" : ""
                  }`}
                  onClick={() => handleTabChange("input-name")}
                >
                  {sectionName || "Your section here..."}
                </a>
              </div>
              <div className="mt-4">
                {activeTab === "recent-records" && (
                  <div>
                    <p className="text-lg font-semibold">
                      Recent Records Content
                    </p>
                    <p className="text-sm text-gray-600">
                      Here you can view the most recent health records for the
                      pet.
                    </p>
                  </div>
                )}
                {activeTab === "medical-history" && (
                  <div>
                    <p className="text-lg font-semibold">
                      Medical History Content
                    </p>
                    <p className="text-sm text-gray-600">
                      Here you can view the pet's medical history, including
                      treatments, surgeries, etc.
                    </p>
                  </div>
                )}
                {activeTab === "input-name" && (
                  <div>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        {/* Headings */}
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Due</th>
                            <th>Weight</th>
                            <th>Description</th>
                            <th>Diagnosis</th>
                            <th>Test Performed</th>
                            <th>Test Results</th>
                            <th>Prescribed Action</th>
                            <th>Prescribed Medication</th>
                            <th>Veterinarian</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Row 1 */}
                          <tr>
                            <td>2024-10-01</td>
                            <td>2024-12-01</td>
                            <td>10kg</td>
                            <td>Regular Checkup</td>
                            <td>Healthy</td>
                            <td>Blood Test</td>
                            <td>Normal</td>
                            <td>Continue current care</td>
                            <td>None</td>
                            <td>Dr. Smith</td>
                            <td>No issues reported</td>
                          </tr>
                          {/* Row 2 */}
                          <tr className="hover">
                            <td>2024-10-05</td>
                            <td>2024-12-01</td>
                            <td>10kg</td>
                            <td>Skin Rash</td>
                            <td>Allergy</td>
                            <td>Skin Scraping</td>
                            <td>Inflammation Detected</td>
                            <td>Prescribed ointment</td>
                            <td>Hydrocortisone Cream</td>
                            <td>Dr. Johnson</td>
                            <td>Monitor for improvement</td>
                          </tr>
                          {/* Row 3 */}
                          <tr>
                            <td>2024-10-10</td>
                            <td>2024-12-01</td>
                            <td>10kg</td>
                            <td>Vomiting</td>
                            <td>Indigestion</td>
                            <td>Ultrasound</td>
                            <td>Normal</td>
                            <td>Change diet</td>
                            <td>Prescription Diet</td>
                            <td>Dr. Taylor</td>
                            <td>Recommended follow-up</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex justify-between">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md duration-200 ease-in-out transition"
            onClick={handleSave}
          >
            {isEditing ? "Save Changes" : "Add Section"}
          </button>{" "}
        </div>
      </div>
    </div>
  );
}

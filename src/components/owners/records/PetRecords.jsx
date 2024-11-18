import React, { useState, useEffect } from "react";
import RecordsTab from "./RecordsTab";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";

const PetRecords = ({ petUid, projectId, isClient = false  }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [dynamicTabs, setDynamicTabs] = useState([]);


  console.log(petUid, "\n", projectId, "\n", isClient);
  // Fixed tabs
  const fixedTabs = [
    { id: "all", name: "All" },
    { id: "recent-record", name: "Recent Records" },
    { id: "medical-history", name: "Medical History" },
  ];

  // Fetch sections from Firestore
  const fetchSections = async () => {
    try {
      const sectionsRef = collection(db, `pet-health-sections/${projectId}/sections`);
      const snapshot = await getDocs(sectionsRef);

      // Extract section names and IDs
      const sections = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setDynamicTabs(sections);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchSections();
    }
  }, [projectId]);

  // Handler for changing tabs
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-4 print:shadow-none print:rounded-none print:overflow-visible">
      
      <div className="hidden print:block font-bold">
        <h1 className="text-2xl">Pet Health Records</h1>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed print:hidden">
        {fixedTabs.concat(dynamicTabs).map((tab) => (
          <p
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "tab-active" : "tab-bordered"}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.name}
          </p>
        ))}
      </div>

      {/* Render the RecordsTab based on the active tab */}
      <div className="mt-4">
        <RecordsTab projectId={projectId} petId={petUid} sectionId={activeTab} isClient={isClient} />
      </div>
    </div>
  );
};

export default PetRecords;

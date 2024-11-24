import React, { useState, useEffect } from "react";
import RecordsTab from "./RecordsTab";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import AnimalAdoptionRecordsTab from "./AnimalAdoptionRecordsTab";

const AnimalAdoptionRecords = ({ petUid, projectId, isClient = false  }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [dynamicTabs, setDynamicTabs] = useState([]);


  console.log(petUid, "\n", projectId, "\n", isClient);
  // Fixed tabs
  const fixedTabs = [
    { id: "all", name: "All" },
    { id: "recent-record", name: "Recent Records" },
    // { id: "medical-history", name: "Medical History" },
  ];

  // Fetch sections from Firestore
  const fetchSections = async () => {
    try {
      const sectionsRef = collection(db, `adoption-record-sections/${projectId}/sections`);
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
    <div className="bg-white px-6 py-6 print:py-0 rounded-lg shadow-lg mt-4 print:shadow-none">

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
        <AnimalAdoptionRecordsTab projectId={projectId} petId={petUid} sectionId={activeTab} isClient={isClient} />
      </div>
    </div>
  );
  
};

export default AnimalAdoptionRecords;

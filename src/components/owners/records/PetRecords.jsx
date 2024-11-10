import React, { useState, useEffect } from 'react';
import RecordsTab from './RecordsTab';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

const PetRecords = ({ petUid, projectId }) => {
    const [activeTab, setActiveTab] = useState('Recent Record');
    const [dynamicTabs, setDynamicTabs] = useState([]);

    // Fixed tabs that should always be present
    const fixedTabs = [
        { id: 'recent-record', name: 'Recent Record' },
        { id: 'medical-history', name: 'Medical History' }
    ];

    // Fetch sections from Firestore
    const fetchSections = async () => {
        try {
            const sectionsRef = collection(db, `pet-health-sections/${projectId}/sections`);
            const snapshot = await getDocs(sectionsRef);

            // Extract section names and IDs
            const sections = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name
            }));
            
            setDynamicTabs(sections);
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchSections();
        }
    }, [projectId]);

    // Handler to change the active tab
    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    // Function to render the component based on active tab
    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'recent-record':
                return <RecordsTab />;
            case 'medical-history':
                return <RecordsTab projectId={projectId} sectionId="medical-history" petId={petUid} />;
            default:
                return <RecordsTab projectId={projectId} sectionId={activeTab} petId={petUid} />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
            {/* Render the dynamic tabs */}
            <div className="tabs tabs-boxed">
                {fixedTabs.concat(dynamicTabs).map((tab) => (
                    <p
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'tab-active' : 'tab-bordered'}`}
                        onClick={() => handleTabClick(tab.id)}
                    >
                        {tab.name}
                    </p>
                ))}
            </div>

            {/* Render the active component */}
            <div className="mt-4">
                {renderActiveComponent()}
            </div>
        </div>
    );
};

export default PetRecords;

import React, { useState } from 'react';
import { IoIosAddCircleOutline } from 'react-icons/io';
import RecordsVaccination from './RecordsVaccination';
import RecordsDeworming from './RecordsDeworming';
import RecordsMedicalHistory from './RecordsMedicalHistory';
import RecordsRecentRecord from './RecordsRecentRecord';
import RecordsServices from './RecordsServices';

const PetRecords = ({petUid}) => {
    const [activeTab, setActiveTab] = useState('Recent Record'); // State to manage active tab

    // Handler to change the active tab
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // Function to render the component based on active tab
    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'Recent Record':
                return <RecordsRecentRecord />;
            case 'Vaccination':
                return <RecordsVaccination petId={petUid} />;
            case 'Deworming':
                return <RecordsDeworming petId={petUid}/>;
            case 'Services':
                return <RecordsServices petId={petUid}/>;
            case 'Medical History':
                return <RecordsMedicalHistory petId={petUid}/>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
            <div className="tabs tabs-boxed">
                {/* Tab Buttons */}
                {['Recent Record', 'Vaccination', 'Deworming', 'Services', 'Medical History'].map((tab) => (
                    <p
                        key={tab}
                        className={`tab ${activeTab === tab ? 'tab-active' : 'tab-bordered'}`}
                        onClick={() => handleTabClick(tab)} // Change active tab on click
                    >
                        {tab}
                    </p>
                ))}
            </div>
            <div className="mt-4">
                
                {/* Render the active component */}
                {renderActiveComponent()}
            </div>
        </div>
    );
};

export default PetRecords;

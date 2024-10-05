import React, { useState } from 'react';
import { IoIosAddCircleOutline } from 'react-icons/io';
import RecordsVaccination from './RecordsVaccination';
import RecordsDeworming from './RecordsDeworming';
import RecordsMedicalHistory from './RecordsMedicalHistory';
import RecordsRecentRecord from './RecordsRecentRecord';
import RecordsServices from './RecordsServices';

const PetRecords = () => {
    const [activeTab, setActiveTab] = useState('Vaccination'); // State to manage active tab

    // Handler to change the active tab
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // Function to render the component based on active tab
    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'Vaccination':
                return <RecordsVaccination />;
            case 'Deworming':
                return <RecordsDeworming />;
            case 'Services':
                return <RecordsServices />;
            case 'Medical History':
                return <RecordsMedicalHistory />;
            case 'Recent Record':
                return <RecordsRecentRecord />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
            <div className="tabs tabs-boxed">
                {/* Tab Buttons */}
                {['Vaccination', 'Deworming', 'Services', 'Medical History', 'Recent Record'].map((tab) => (
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
                <button className="btn btn-success btn-sm text-white">
                    <IoIosAddCircleOutline /> Add Record
                </button>
                
                {/* Render the active component */}
                {renderActiveComponent()}
            </div>
        </div>
    );
};

export default PetRecords;

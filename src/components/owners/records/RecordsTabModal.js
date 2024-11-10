import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';

export default function RecordsTabModal({ projectId, sectionId, petId, onClose, onRecordAdded }) {
    const [newRecord, setNewRecord] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        diagnosis: '',
        testPerformed: '',
        testResults: '',
        prescribedAction: '',
        prescribedMedication: '',
        veterinarian: '',
        notes: ''
    });

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewRecord({ ...newRecord, [name]: value });
    };

    // Add new record to Firestore
    const handleAddRecord = async (e) => {
        e.preventDefault();
    
        // Validation: Check if all fields are filled
        const { date, description, diagnosis, testPerformed, testResults, prescribedAction, prescribedMedication, veterinarian, notes } = newRecord;
    
        if (
            !date ||
            !description ||
            !diagnosis ||
            !testPerformed ||
            !testResults ||
            !prescribedAction ||
            !prescribedMedication ||
            !veterinarian ||
            !notes
        ) {
            toast.error("Please fill out all fields.");
            return;
        }
    
        try {
            const recordsRef = collection(db, `pet-health-records`);
            await addDoc(recordsRef, { ...newRecord, projectId, sectionId, petId });
    
            // Clear the form after successful submission
            setNewRecord({
                date: new Date().toISOString().split('T')[0],
                description: '',
                diagnosis: '',
                testPerformed: '',
                testResults: '',
                prescribedAction: '',
                prescribedMedication: '',
                veterinarian: '',
                notes: ''
            });
    
            onRecordAdded();
            toast.success("New record added successfully.");
            onClose();
        } catch (error) {
            toast.error("An error occurred while adding the record.");
        }
    };
    

    // Close modal when clicking outside of it
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleBackgroundClick}
        >
            <div
                className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto z-50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <IoClose
                    className="absolute top-2 right-2 text-2xl cursor-pointer"
                    onClick={onClose}
                />

                {/* Modal Header */}
                <h3 className="font-bold text-lg mb-4">Add New Record</h3>

                {/* Form */}
                <form onSubmit={handleAddRecord} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={newRecord.date}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea
                            name="description"
                            value={newRecord.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Diagnosis</label>
                        <input
                            type="text"
                            name="diagnosis"
                            value={newRecord.diagnosis}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Test Performed</label>
                        <input
                            type="text"
                            name="testPerformed"
                            value={newRecord.testPerformed}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Test Results</label>
                        <input
                            type="text"
                            name="testResults"
                            value={newRecord.testResults}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Prescribed Action</label>
                        <input
                            type="text"
                            name="prescribedAction"
                            value={newRecord.prescribedAction}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Prescribed Medication</label>
                        <input
                            type="text"
                            name="prescribedMedication"
                            value={newRecord.prescribedMedication}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Veterinarian</label>
                        <input
                            type="text"
                            name="veterinarian"
                            value={newRecord.veterinarian}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Notes</label>
                        <textarea
                            name="notes"
                            value={newRecord.notes}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 mt-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

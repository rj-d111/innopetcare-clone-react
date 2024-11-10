import React from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path as necessary
import { toast } from 'react-toastify';

export default function OwnerAdoptionModalDelete({ uid, petName, closeDeleteModal }) {
  const handleDeleteConfirmation = async () => {
    try {
      // Reference the document to delete
      const adoptionDoc = doc(db, "adoptions", uid);
      // Delete the document
      await deleteDoc(adoptionDoc);
      // Notify user and close modal
      toast.success("Pet record successfully deleted");
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting adoption: ", error);
      toast.error("Failed to delete pet record");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Delete Confirmation</h2>
        <p className="text-gray-700 mb-6">
          <p className='py-5'>You are about to delete the pet record for {petName}. This action cannot be undone. Please confirm that you want to proceed with the deletion.</p>

          <p><span className="font-bold">Pet Name:</span> {petName}</p>
          <p><span className="font-bold">Pet ID:</span> {uid}</p>
          <p className='py-5'>Do you want to continue?</p>
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={closeDeleteModal}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirmation}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

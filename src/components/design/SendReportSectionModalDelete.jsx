import React from "react";
import { toast } from "react-toastify";

export default function SendReportSectionModalDelete({ 
  title = "Delete Confirmation", 
  message, 
  onConfirm, 
  onCancel 
}) {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        {/* Modal Title */}
        <h2 className="text-2xl font-semibold text-red-600 mb-4">{title}</h2>
        
        {/* Modal Message */}
        <p className="text-gray-700 mb-6">{message}</p>
        
        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            onClick={() => {
              onConfirm();
              toast.success("Report question deleted successfully");
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

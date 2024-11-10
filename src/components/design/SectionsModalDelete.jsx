const SectionsModalDelete = ({ show, onClose, projectId, sectionTitle, onDelete }) => {
    if (!show) return null;
  
    const handleDeleteConfirmation = () => {
      onDelete(projectId);
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-semibold mb-4">Delete Confirmation</h2>
          <div className="text-gray-700 mb-6">
            <p className="py-5">
              You are about to delete the section titled <span className="font-bold">{sectionTitle}</span>. 
              This action cannot be undone. Please confirm that you want to proceed with the deletion.
            </p>
            <p>Do you want to continue?</p>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
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
  };
  
export default SectionsModalDelete;
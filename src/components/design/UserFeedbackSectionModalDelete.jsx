function UserFeedbackSectionModalDelete({ message, onConfirm, onCancel }) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Delete Question</h2>
          <p>{message}</p>
          <div className="flex justify-between mt-4">
            <button
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg w-full font-semibold transition duration-200 mr-2"
            >
              Delete
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded-lg w-full font-semibold transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default UserFeedbackSectionModalDelete;
  
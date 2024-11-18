import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { db, storage } from "../../firebase"; // Make sure to import storage if you use Firebase storage
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { AiFillPicture, AiOutlineLoading3Quarters } from "react-icons/ai";

export default function ServicesModal({
  projectId,
  closeModal,
  onServiceAdded,
  selectedService,
}) {
  const auth = getAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  // Pre-fill the form if editing a service
  useEffect(() => {
    if (selectedService) {
      setTitle(selectedService.title);
      setDescription(selectedService.description);
      setIconPreview(selectedService.icon || ""); // Set icon preview if available
    } else {
      setTitle("");
      setDescription("");
      setIcon(null);
      setIconPreview("");
    }
  }, [selectedService]);

  // Handle image upload and preview
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIcon(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      let iconUrl = iconPreview;

      // If a new icon is uploaded, upload it to Firebase storage
      if (icon) {
        const iconRef = ref(
          storage,
          `services/${auth.currentUser.uid}/${icon.name}`
        );
        await uploadBytes(iconRef, icon);
        iconUrl = await getDownloadURL(iconRef);
      }

      if (selectedService) {
        // If editing, update the existing service
        const serviceDocRef = doc(db, "services", selectedService.id);
        await updateDoc(serviceDocRef, { title, description, icon: iconUrl });
        toast.success(`${title} successfully updated`);
      } else {
        // If adding new, create a new service
        await addDoc(collection(db, "services"), {
          title,
          description,
          icon: iconUrl,
          projectId,
          userId: auth.currentUser.uid,
        });
        toast.success("Service successfully added");
      }

      onServiceAdded();
      closeModal();
    } catch (error) {
      console.error("Error adding/updating service:", error);
      toast.error("Failed to add/update service");
    } finally {
      setLoading(false); // Stop loading
    }
  };


  return (
    <div className="bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        {/* Close Button */}
        <IoClose
          className="text-red-600 text-2xl absolute top-4 right-4 cursor-pointer"
          onClick={closeModal}
        />
        <h2 className="text-lg font-bold mb-4">
          {selectedService ? "Edit Service" : "Add a Service"}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          {/* Icon Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Icon</label>
            <div className="mt-3">
              <label
                htmlFor="icon-upload"
                className="flex items-center justify-center cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
              >
                <AiFillPicture className="mr-2 text-lg" />
                Choose Icon
              </label>
              <input
                id="icon-upload"
                type="file"
                accept="image/*, .svg"
                onChange={handleIconChange}
                className="hidden"
              />
            </div>
            {/* Icon Preview */}
            {iconPreview && (
              <div className="mt-4">
                {icon?.type === "image/svg+xml" ? (
                  <object
                    data={iconPreview}
                    type="image/svg+xml"
                    className="w-32 h-32"
                    aria-label="SVG Preview"
                  />
                ) : (
                  <img
                    src={iconPreview}
                    alt="Icon Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold"
              disabled={loading}
            >
  {loading ? (
                <>
                  <div className="flex items-center">
                    <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                    Processing...
                  </div>
                </>
              ) : selectedService ? (
                "Update Service"
              ) : (
                "Save Service"
              )}
                  </button>
          </div>
        </form>
      </div>
    </div>
  );
}

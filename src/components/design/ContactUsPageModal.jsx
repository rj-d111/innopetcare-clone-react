import React, { useState, useEffect } from "react";
import { addDoc, updateDoc, doc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useParams } from "react-router";
import { IoClose } from "react-icons/io5";

export default function ContactUsPageModal({ projectId, closeModal, onSectionAdded, selectedSection }) {
  const [selectedType, setSelectedType] = useState("");
  const [content, setContent] = useState("");
  const [customType, setCustomType] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const options = [
    { label: "Phone No.", value: "phone" },
    { label: "Landline No.", value: "landline" },
    { label: "Email", value: "email" },
    { label: "Address", value: "address" },
    { label: "Facebook", value: "facebook" },
    { label: "Messenger", value: "messenger" },
    { label: "YouTube", value: "youtube" },
    { label: "X (Twitter)", value: "x" },
    { label: "Instagram", value: "instagram" },
    { label: "Reddit", value: "reddit" },
    { label: "TikTok", value: "tiktok" },
    { label: "LinkedIn", value: "linkedin" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "Viber", value: "viber" },
    { label: "Telegram", value: "telegram" },
    { label: "Others", value: "others" },
  ];

  useEffect(() => {
    if (selectedSection) {
      setSelectedType(selectedSection.type);
      setContent(selectedSection.content);
      setIsEditing(true);
    }
  }, [selectedSection]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // const validateURL = (url) => {
  //   return /^(https?:\/\/)?((www\.)?instagram\.com|facebook\.com|youtube\.com|linkedin\.com|tiktok\.com|twitter\.com|x\.com|reddit\.com|telegram\.me|whatsapp\.com)/i.test(url);
  // };

  const handleSave = async (e) => {
    e.preventDefault();
  
    const trimmedContent = content.trim();
    if (!selectedType || !trimmedContent) {
      toast.error("Please fill in all fields!");
      return;
    }
  
    if (selectedType === "email" && !validateEmail(trimmedContent)) {
      toast.error("Please enter a valid email address.");
      return;
    }
  
    // Find the label for the selected type
    const selectedOption = options.find(option => option.value === selectedType);
    const label = selectedOption ? selectedOption.label : customType;
  
    const contactData = {
      type: selectedType, // Value from the dropdown menu
      name: label,        // Label associated with the value
      content: trimmedContent,
      sectionCreated: serverTimestamp(),
    };
  
    try {
      if (isEditing && selectedSection) {
        const sectionDocRef = doc(db, "contact-sections", projectId, "sections", selectedSection.id);
        await updateDoc(sectionDocRef, contactData);
        toast.success("Contact section updated successfully");
      } else {
        const sectionsCollectionRef = collection(db, "contact-sections", projectId, "sections");
        await addDoc(sectionsCollectionRef, contactData);
        toast.success("Contact section added successfully");
      }
  
      onSectionAdded();
      closeModal();
    } catch (error) {
      console.error("Error saving contact section:", error);
      toast.error("Error saving contact section");
    }
  };
  
  

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Contact Section" : "Add Contact Section"}</h2>
          <IoClose className="text-red-600 text-2xl cursor-pointer" onClick={closeModal} />
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Select Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select an option</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {selectedType === "others" && (
            <div>
              <label className="block text-sm font-medium">Specify Type</label>
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter the type (e.g., Skype, Discord, etc.)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Details</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter details here..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {isEditing ? "Save Changes" : "Add Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

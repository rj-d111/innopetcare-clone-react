import React, { useState, useEffect } from "react";
import {
  addDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useParams } from "react-router";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import customMarker from "./customMarker"; // Ensure this import is correct
import "leaflet/dist/leaflet.css";

const locationIQToken = "pk.71c987e9d0e505df233f7b6ae288f93a";

export default function ContactUsPageModal({
  projectId,
  closeModal,
  onSectionAdded,
  selectedSection,
}) {
  const [selectedType, setSelectedType] = useState("");
  const [content, setContent] = useState("");
  const [customType, setCustomType] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [addressStatus, setAddressStatus] = useState(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  const options = [
    { label: "Phone No.", value: "phone" },
    { label: "Landline No.", value: "landline" },
    { label: "Email", value: "email" },
    { label: "Address", value: "address" },
    // { label: "Google Maps URL", value: "googleMapsUrl" },
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

      // If editing an address, show manual coordinates by default
      // if (selectedSection.type === "address" && selectedSection.location) {
      //   setShowManualCoordinates(true);
      //   setLatitude(selectedSection.location.latitude);
      //   setLongitude(selectedSection.location.longitude);
      // }

      if (selectedSection.type === "address" && selectedSection.location) {
        setLatitude(selectedSection.location.latitude);
        setLongitude(selectedSection.location.longitude);
      }
    }
  }, [selectedSection]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // const validateURL = (url) => {
  //   return /^(https?:\/\/)?((www\.)?instagram\.com|facebook\.com|youtube\.com|linkedin\.com|tiktok\.com|twitter\.com|x\.com|reddit\.com|telegram\.me|whatsapp\.com)/i.test(url);
  // };

  const handleSearchAddress = async () => {
    if (searchAddress.trim().length < 3) {
      setAddressStatus("error");
      toast.error("Please enter a valid address");
      return;
    }

    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search?key=${locationIQToken}&q=${encodeURIComponent(
          searchAddress
        )}&format=json`
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setLatitude(lat);
        setLongitude(lon);
        setAddressStatus("success");
        toast.success("Address found!");
      } else {
        setAddressStatus("error");
      }
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      setAddressStatus("error");
      toast.error("Unable to fetch geolocation");
    }
  };

  const handleExtractCoordinates = async () => {
    try {
      if (!googleMapsUrl.startsWith("https://www.google.com/maps/")) {
        setAddressStatus("error");
        toast.error(
          "Invalid URL. Please use a Google Maps link starting with https://www.google.com/maps/"
        );
        return;
      }

      const decodedUrl = decodeURIComponent(googleMapsUrl);
      const urlMatch = decodedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

      if (urlMatch) {
        const lat = parseFloat(urlMatch[1]);
        const lon = parseFloat(urlMatch[2]);

        // Reverse geocode to get the address
        const response = await axios.get(
          `https://us1.locationiq.com/v1/reverse.php?key=${locationIQToken}&lat=${lat}&lon=${lon}&format=json`
        );

        const addressName = response.data.display_name || "Unnamed location";

        // Update the state
        setLatitude(lat);
        setLongitude(lon);
        setAddressStatus("success");
        setContent(addressName); // Update content with the extracted address
        toast.success("Address extracted successfully!");
      } else {
        setAddressStatus("error");
        toast.error("Failed to extract coordinates. Invalid Google Maps URL.");
      }
    } catch (error) {
      console.error("Error extracting address:", error);
      setAddressStatus("error");
      toast.error("An error occurred while extracting the address.");
    }
  };

  // Handle manual coordinates input
  const handleManualCoordinates = () => {
    if (latitude && longitude) {
      setAddressStatus("manual");
      toast.success("Manual coordinates updated");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
  
    const trimmedContent = content.trim();
    if (!selectedType || !trimmedContent) {
      toast.error("Please fill in all fields!");
      return;
    }
  
    // Get the label for the selected type
    const selectedOption = options.find(
      (option) => option.value === selectedType
    );
    const label = selectedOption ? selectedOption.label : customType;
  
    // Prepare the contact data object
    const contactData = {
      type: selectedType,
      name: label,
      content: trimmedContent,
    };
  
    // Handle address type with coordinates and Google Maps URL
    if (selectedType === "address") {
      contactData.location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
      contactData.googleMapsUrl = googleMapsUrl || ""; // Save the Google Maps URL
    }
  
    try {
      if (isEditing && selectedSection) {
        // If updating an existing section, do not include 'sectionCreated'
        const sectionDocRef = doc(
          db,
          "contact-sections",
          projectId,
          "sections",
          selectedSection.id
        );
        await updateDoc(sectionDocRef, contactData);
        toast.success("Contact section updated successfully");
      } else {
        // If adding a new section, include 'sectionCreated'
        contactData.sectionCreated = serverTimestamp();
        const sectionsCollectionRef = collection(
          db,
          "contact-sections",
          projectId,
          "sections"
        );
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative overflow-y-auto max-h-screen">
        {/* Close Button and Heading */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isEditing ? "Edit Contact Section" : "Add Contact Section"}
          </h2>
          <IoClose
            className="text-red-600 text-2xl cursor-pointer"
            onClick={closeModal}
          />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Type Selection */}
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

          {/* Custom Type Input */}
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

          {/* Google Maps URL Input */}
          {selectedType === "address" && (
            <>
              <div>
                 <label className="font-medium block text-sm">Paste Google Maps Link</label>
                {/* Input and Extract Button Side by Side */}
                <div className="flex space-x-2 py-2">
                  <input
                    type="text"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder={
                      addressStatus === "success"
                        ? "Google Maps URL valid and coordinates extracted."
                        : "Paste Google Maps link here..."
                    }
                    className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg ${
                      addressStatus === "success" ? "bg-gray-100" : "bg-white"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleExtractCoordinates}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                  >
                    Extract
                  </button>
                </div>

                {/* Display Extracted Address in Textarea */}
                <label className="font-medium block text-sm">Address</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="3"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg mt-2 ${
                    addressStatus === "success" || addressStatus === null
                      ? "bg-gray-100"
                      : "bg-white"
                  }`}
                  placeholder={
                    addressStatus === "success"
                      ? "Extracted address will appear here"
                      : "Enter address here"
                  }
                ></textarea>

                {/* Display Latitude and Longitude */}
                {latitude && longitude && (
                  <p className="text-xs mt-2 text-gray-600">
                    Latitude: {latitude}, Longitude: {longitude}
                  </p>
                )}
              </div>

              {latitude && longitude && (
  <div className="mt-4">
    <iframe
      title="Google Maps"
      width="100%"
      height="300"
      frameBorder="0"
      style={{ border: 0 }}
      src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=14&output=embed`}
      allowFullScreen
    ></iframe>
  </div>
)}

            </>
          )}

          {/* Details Text Area */}
          {selectedType !== "address" && (
            <div>
              <label className="block text-sm font-medium">Details</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={"Enter details here..."}
              ></textarea>
            </div>
          )}

          {/* Address Section */}
          {selectedType === "llll" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleSearchAddress}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg"
              >
                Search Address
              </button>
              {addressStatus === "error" && (
                <div
                  className="bg-red-100 text-red-700 p-2 rounded cursor-pointer"
                  onClick={() => setShowManualCoordinates(true)}
                >
                  Address not found. Enter coordinates manually.
                </div>
              )}

              {/* Manual Coordinates Input */}
              {showManualCoordinates && (
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Latitude"
                    value={latitude || ""}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Longitude"
                    value={longitude || ""}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleManualCoordinates}
                    className="w-full bg-green-500 text-white py-2 rounded-lg"
                  >
                    Update Coordinates
                  </button>
                </div>
              )}

              {/* Map Display */}
              {latitude && longitude && (
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={15}
                  style={{ height: "200px", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[latitude, longitude]}
                    icon={customMarker}
                  />
                </MapContainer>
              )}
            </div>
          )}

          {/* Buttons */}
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

const MapViewUpdater = ({ latitude, longitude }) => {
  const map = useMap();
  if (latitude && longitude) {
    map.setView([latitude, longitude], map.getZoom());
  }
  return null;
};

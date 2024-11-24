import React, { useEffect, useState } from "react";
import { db } from "../../firebase.js";
import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  GeoPoint,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  ref,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Spinner from "../Spinner.jsx";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import customMarker from "./customMarker.js"; // Import the custom marker
import { FaSearch } from "react-icons/fa";
import MapUpdater from "./MapUpdater.js";
import {
  ChromePicker,
  CirclePicker,
  CompactPicker,
  SliderPicker,
  SwatchesPicker,
  TwitterPicker,
} from "react-color";

export default function GlobalSections({
  formData,
  setFormData,
  setImagePreview,
}) {
  const auth = getAuth();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [documentExists, setDocumentExists] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [addressStatus, setAddressStatus] = useState(null); // For displaying alerts
  const [searchAddress, setSearchAddress] = useState(formData.address || "");
  const [urlAddress, setUrlAddress] = useState("");
  const [longitude, setLongitude] = useState(null);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false);
  const locationIQToken = "pk.71c987e9d0e505df233f7b6ae288f93a";

  useEffect(() => {
    const fetchDocument = async () => {
      const docRef = doc(db, "global-sections", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const docData = docSnap.data();
        setFormData({
          name: docData.name || "",
          slug: docData.slug || "",
          address: docData.address || "", // Include address field
          geoPoint: docData.location || null,
          headerColor: docData.headerColor || "#1e88e5", // Ensure default HEX code
          headerTextColor: docData.headerTextColor || "#ffffff", // Ensure default HEX code          logoPicture: docData.image || "",
          selectedItemColor: docData.selectedItemColor || "#bc1823",
          googleMapsUrl: docData.googleMapsUrl || "",
        });
        setLatitude(docData.location?.latitude);
        setLongitude(docData.location?.longitude);
        setDocumentExists(true);
      } else {
        setDocumentExists(false);
      }
    };

    fetchDocument();
  }, [id, setFormData]);

  const handleExtractCoordinates = async () => {
    try {
      // Validate the URL before decoding
      if (!urlAddress.startsWith("https://www.google.com/maps/")) {
        setAddressStatus("error");
        toast.error("The URL must be a valid Google Maps link.");
        return; // Exit the function
      }

      // Decode the URL to handle any URL encoding
      const decodedUrl = decodeURIComponent(urlAddress);

      // Check if the URL contains latitude and longitude at the "@" character
      const urlMatch = decodedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

      if (urlMatch) {
        const lat = parseFloat(urlMatch[1]);
        const lon = parseFloat(urlMatch[2]);

        // Fetch the address name using reverse geocoding
        const response = await axios.get(
          `https://us1.locationiq.com/v1/reverse.php?key=${locationIQToken}&lat=${lat}&lon=${lon}&format=json`
        );

        const addressName = response.data.display_name;

        // Update formData and state
        setFormData((prev) => ({
          ...prev,
          geoPoint: new GeoPoint(lat, lon),
          address: addressName || "Unnamed location", // Update the address name
        }));
        setLatitude(lat);
        setLongitude(lon);
        setAddressStatus("success");
        toast.success("Coordinates and address extracted successfully!");
        return;
      }

      // If no match is found
      setAddressStatus("error");
      toast.error("Invalid Google Maps URL format.");
    } catch (error) {
      console.error("Error during address extraction:", error);
      setAddressStatus("error");
      toast.error("Invalid URL or failed to fetch address. Please try again.");
    }
  };

  const handleColorChange = (color, fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: color.hex }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  function onChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      const newSlug = generateSlug(value);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }

    if (e.target.files && e.target.files[0]) {
      const uploadedImage = e.target.files[0];
      setImage(uploadedImage);
      setFormData((prevState) => ({
        ...prevState,
        logoPicture: uploadedImage,
      }));

      const imagePreviewUrl = URL.createObjectURL(uploadedImage);
      setImagePreview(imagePreviewUrl);
      setImagePreviewUrl(imagePreviewUrl);
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.value,
      }));
    }
  }

  const handleSearchAddress = async () => {
    setShowManualCoordinates(false);
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
        const { lat, lon, display_name } = response.data[0];

        // Update formData with the fetched address and coordinates
        setFormData((prev) => ({
          ...prev,
          address: searchAddress,
          geoPoint: new GeoPoint(parseFloat(lat), parseFloat(lon)),
        }));

        // Update state variables for the map
        setLatitude(parseFloat(lat));
        setLongitude(parseFloat(lon));
        setAddressStatus("success");
      } else {
        setAddressStatus("error");
      }
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      setAddressStatus("error");
    }
  };

  // Function to handle manual latitude and longitude entry
  const handleManualCoordinates = () => {
    console.log("Manual Coordinates:", latitude, longitude);

    // Check if both latitude and longitude are valid
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      // Update the formData with new coordinates
      setFormData((prev) => ({
        ...prev,
        geoPoint: new GeoPoint(lat, lon),
      }));

      // Update the state variables used by the map
      setLatitude(lat);
      setLongitude(lon);

      setAddressStatus("manual");
    }
  };

  async function storeImage(image) {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  }

  const deleteImage = async () => {
    if (formData.logoPicture) {
      try {
        const storage = getStorage();
        const imageRef = ref(storage, formData.logoPicture);
        await deleteObject(imageRef);
        setFormData((prevState) => ({ ...prevState, logoPicture: null }));
        setImagePreviewUrl(null);
        toast.success("Image deleted successfully");
      } catch (error) {
        console.error("Error deleting image:", error);
        toast.error("Failed to delete image");
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log(formData);

    // Validation to ensure required fields are filled
    if (
      !formData.name ||
      !formData.slug ||
      !formData.headerColor ||
      !formData.selectedItemColor ||
      !formData.address ||
      !formData.geoPoint
    ) {
      setLoading(false);
      toast.error("Please fill out all the required fields");
      return;
    }

    try {
      let logoPictureUrl;

      // Upload image if it exists and is a File object
      if (image) {
        logoPictureUrl = await storeImage(image); // Upload image and get the URL
      } else if (typeof formData.logoPicture === "string") {
        logoPictureUrl = formData.logoPicture; // Use existing URL if no new image is uploaded
      } else {
        logoPictureUrl = null; // No image provided
      }

      // Create a new document with the given projectId
      const docRef = doc(db, "global-sections", id);
      await setDoc(docRef, {
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        googleMapsUrl: urlAddress, // Create the Google Maps URL
        location: formData.geoPoint,
        headerColor: formData.headerColor,
        headerTextColor: formData.headerTextColor || "#ffffff",
        selectedItemColor: formData.selectedItemColor,
        image: logoPictureUrl, // Store the uploaded image URL or null
      });

      toast.success("Global section created successfully!");
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    console.log(formData);
  
    // Validation to ensure required fields are filled
    if (
      !formData.name ||
      !formData.slug ||
      !formData.headerColor ||
      !formData.headerTextColor ||
      !formData.selectedItemColor ||
      !formData.address ||
      !formData.geoPoint
    ) {
      setLoading(false);
      toast.error("Please fill out all the required fields");
      return;
    }
  
    try {
      let logoPictureUrl = formData.logoPicture;
  
      // Upload a new image only if one is provided
      if (image) {
        // If a new image is uploaded, upload it to storage
        if (formData.logoPicture && typeof formData.logoPicture === "string") {
          await deleteImage(); // Delete the existing image if needed
        }
        logoPictureUrl = await storeImage(image); // Upload and get the new image URL
      }
  
      // Prepare the update data
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        googleMapsUrl: formData.googleMapsUrl, // Save the Google Maps URL
        location: formData.geoPoint,
        headerColor: formData.headerColor,
        headerTextColor: formData.headerTextColor,
        selectedItemColor: formData.selectedItemColor,
      };
  
      // Only update the image field if a new image was uploaded
      if (image) {
        updateData.image = logoPictureUrl;
      }
  
      // Update the existing document directly using the projectId as docId
      const docRef = doc(db, "global-sections", id);
      await updateDoc(docRef, updateData);
  
      toast.success("Global section updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update changes");
    } finally {
      setLoading(false);
    }
  };
  
  
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="p-6 md:max-w-full  mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 ">
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Global Sections</h2>
        <p className="text-sm text-gray-700">
          Global sections simplify displaying consistent content on multiple
          pages, like headers, footers, and sidebars.
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Name of Management System
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          placeholder="Enter here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          onChange={onChange}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Slug (ex. fort-deo)</label>
        <div className="bg-yellow-100 p-4 rounded-md">
          <p className="text-xs">
            Note: Spaces or special characters like !, @, #, $, %, &, *, etc.
            are not allowed. Instead, use hyphens (-) to separate words. For
            example, use my-page instead of my page
          </p>
        </div>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          placeholder="Enter here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          onChange={onChange}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Logo Picture</label>
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
        />
      </div>

      {(imagePreviewUrl || formData.logoPicture) && (
        <div className="mt-4">
          <h3 className="text-sm font-medium">Logo Preview:</h3>
          <img
            src={imagePreviewUrl || formData.logoPicture}
            alt="Logo Preview"
            className="mt-2 w-32 h-32 object-cover rounded"
          />
        </div>
      )}

      {/* Header Color Picker */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Color</label>
        <CompactPicker
          color={formData.headerColor || "#1e88e5"}
          onChange={(color) => handleColorChange(color, "headerColor")}
        />
        <p className="mt-2 text-xs">Selected Color: {formData.headerColor}</p>
      </div>

      {/* Header Text Color Picker */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Text Color</label>
        <CompactPicker
          color={formData.headerTextColor || "#ffffff"}
          onChange={(color) => handleColorChange(color, "headerTextColor")}
        />
        <p className="mt-2 text-xs">
          Selected Text Color: {formData.headerTextColor}
        </p>
      </div>

      {/* Selected Item Color Picker */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Selected Item Color (For Mobile)
        </label>
        <CompactPicker
          color={formData.selectedItemColor || "#bc1823"}
          onChange={(color) => handleColorChange(color, "selectedItemColor")}
        />
        <p className="mt-2 text-xs">
          Selected Item Color: {formData.selectedItemColor}
        </p>
      </div>

      <div>
        {/* Alert Message */}
        {addressStatus && (
          <div
            className={`mt-2 p-2 text-xs rounded ${
              addressStatus === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
            onClick={() => setShowManualCoordinates(true)}
          >
            {addressStatus === "success"
              ? "Address found successfully!"
              : "Address not found. Enter address and coordinates manually."}
          </div>
        )}

        {/* Address Input and Search Button */}
        <div className="space-y-4">
          {/* Google Maps URL Input */}
          <div className="space-y-1">
            <div>
              <label className="block text-sm font-medium">
                Copy and paste your Google Maps link here
              </label>
              <a
                href="https://www.google.com/maps/place"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm underline hover:text-blue-700"
              >
                Open Google Maps
              </a>
            </div>

            <div className="flex">
              <input
                type="text"
                placeholder="Paste Google Maps URL here"
                value={formData.googleMapsUrl || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setUrlAddress(value); // Updates the urlAddress state
                  setFormData((prev) => ({
                    ...prev,
                    googleMapsUrl: value, // Updates the googleMapsUrl in formData
                  }));
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none text-xs"
              />

              <button
                onClick={handleExtractCoordinates}
                className="ml-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
              >
                Extract
              </button>
            </div>
            {addressStatus === "error" && (
              <p className="text-red-500 text-xs mt-1">
                Invalid Google Maps URL
              </p>
            )}
          </div>
          {/* Extracted Address Display */}
          <div className="space-y-1">
            <label className="block text-sm font-medium">Address</label>
            <textarea
              name="address"
              value={formData.address || ""}
              placeholder={
                addressStatus === "success" || addressStatus === null
                  ? "Extracted address will appear here"
                  : "Enter address here"
              }
              rows={3} // Adjust the number of rows for the textarea
              className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none text-xs resize-none ${
                addressStatus === "success" || addressStatus === null
                  ? "bg-gray-100"
                  : "bg-white"
              }`}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              } // Updates formData.address
            />
          </div>

          {/* Latitude Display */}
          <div className="space-y-1">
            <label className="block text-xs font-medium">Latitude</label>
            <input
              type="number"
              value={latitude || ""}
              placeholder={
                addressStatus === "success" || addressStatus === null
                  ? "Extracted latitude will appear here"
                  : "Enter latitude here"
              }
              className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none text-xs ${
                addressStatus === "success" || addressStatus === null
                  ? "bg-gray-100"
                  : "bg-white"
              }`}
              onChange={(e) => setLatitude(e.target.value)} // Updates latitude state
            />
          </div>

          {/* Longitude Display */}
          <div className="space-y-1">
            <label className="block text-xs font-medium">Longitude</label>
            <input
              type="number"
              value={longitude || ""}
              placeholder={
                addressStatus === "success" || addressStatus === null
                  ? "Extracted longitude will appear here"
                  : "Enter longitude here"
              }
              className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none text-xs ${
                addressStatus === "success" || addressStatus === null
                  ? "bg-gray-100"
                  : "bg-white"
              }`}
              onChange={(e) => setLongitude(e.target.value)} // Updates longitude state
            />
          </div>
        </div>

        {/* Embedded Map */}
        {latitude && longitude && (
          <div className="mt-4">
            <iframe
              title="Google Maps Embed"
              width="100%"
              height="300"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=es;z=18&output=embed`}
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={documentExists ? onUpdate : onSubmit}
        className={`w-full uppercase py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:shadow-lg ${
          loading
            ? "bg-yellow-200"
            : documentExists
            ? "bg-violet-500 hover:bg-violet-400 text-white"
            : "bg-yellow-500 hover:bg-yellow-400 text-white"
        }`}
      >
        {documentExists ? "Update Changes" : "Save Changes"}
      </button>
    </div>
  );
}

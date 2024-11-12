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
          headerColor: docData.headerColor || "",
          headerTextColor: docData.headerTextColor || "",
          logoPicture: docData.image || "",
          selectedItemColor: docData.selectedItemColor || "#bc1823",
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

      // Upload image if it exists
      if (image) {
        logoPictureUrl = await storeImage(image);
      }

      // Create a new document with the given projectId
      const docRef = doc(db, "global-sections", id);
      await setDoc(docRef, {
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        location: formData.geoPoint,
        headerColor: formData.headerColor,
        headerTextColor: formData.headerTextColor,
        selectedItemColor: formData.selectedItemColor,
        image: logoPictureUrl || null,
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

      // Upload a new image if one is provided
      if (image) {
        if (formData.logoPicture && typeof formData.logoPicture === "string") {
          await deleteImage(); // Delete the existing image if needed
        }
        logoPictureUrl = await storeImage(image);
      }

      // Update the existing document directly using the projectId as docId
      const docRef = doc(db, "global-sections", id);
      await updateDoc(docRef, {
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        location: formData.geoPoint,
        headerColor: formData.headerColor,
        headerTextColor: formData.headerTextColor,
        selectedItemColor: formData.selectedItemColor,
        image: logoPictureUrl || null,
      });

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

      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Color</label>
        <input
          type="color"
          name="headerColor"
          value={formData.headerColor}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, headerColor: e.target.value }))
          }
          className="w-full h-10 p-0 rounded-lg"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Header Text Color</label>
        <input
          type="color"
          name="headerTextColor"
          value={formData.headerTextColor}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              headerTextColor: e.target.value,
            }))
          }
          className="w-full h-10 p-0 rounded-lg"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">
          Selected Item Color (For Mobile)
        </label>
        <input
          type="color"
          name="selectedItemColor"
          value={formData.selectedItemColor}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              selectedItemColor: e.target.value,
            }))
          }
          className="w-full h-10 p-0 rounded-lg"
        />
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
              : "Address not found. Click here to enter coordinates manually."}
          </div>
        )}

        {/* Address Input and Search Button */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">Address</label>
          <div className="flex">
            <textarea
              name="address"
              value={searchAddress || formData.address}
              rows={2}
              placeholder="Enter address"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none text-xs resize-none"
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <button
              onClick={handleSearchAddress}
              className="ml-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
            >
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Conditional Alerts */}
        {addressStatus && (
          <div
            role="alert"
            className="alert alert-warning  my-2 rounded-md bg-yellow-100 text-yellow-700 cursor-pointer text-xs"
            onClick={() => setShowManualCoordinates((prev) => !prev)}
          >
            <span>
              Location not accurate? Enter manual Latitude and Longitude
              instead. <span className="font-bold">See more</span>
            </span>
          </div>
        )}

        {/* Manual Latitude and Longitude Inputs */}
        {showManualCoordinates && (
          <div className="space-y-2 mt-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium">Latitude</label>
              <input
                type="number"
                value={latitude || ""}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Enter latitude"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium">Longitude</label>
              <input
                type="number"
                value={longitude || ""}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Enter longitude"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none text-xs"
              />
            </div>
            <button
              onClick={handleManualCoordinates}
              className="w-full mt-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            >
              Update Coordinates
            </button>
          </div>
        )}

        {/* Embedded Map */}
        {latitude && longitude && (
          <MapContainer
            center={[latitude, longitude]}
            zoom={18}
            style={{ height: "300px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[latitude, longitude]} icon={customMarker} />
            {/* Add the MapUpdater component here */}
            <MapUpdater latitude={latitude} longitude={longitude} />
          </MapContainer>
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

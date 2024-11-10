import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Firebase config
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { dogBreeds, catBreeds } from "./breeds"; // Adjust the path if necessary
import Spinner from "../../components/Spinner"; // Make sure to import the Spinner component


export default function EditPetModal({ petUid, closeModal }) {
  const [petData, setPetData] = useState({
    petName: "",
    birthdate: "",
    gender: "male",
    species: "dog",
    breed: "",
    weight: "",
    color: "",
    image: null,
    existingConditions: "",
    allergies: "",
    otherSpecies: "",
    otherBreed: "",
    imagePreviewUrl: "",
  });
  const [breeds, setBreeds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Fetch existing pet data on component mount
  useEffect(() => {
    const fetchPetData = async () => {
      const docRef = doc(db, "pets", petUid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPetData({
          ...data,
          imagePreviewUrl: data.image || "",
        });
      } else {
        toast.error("Pet not found");
        closeModal();
      }
    };

    fetchPetData();
  }, [petUid]);

  // Fetch breeds based on species selection
  useEffect(() => {
    if (petData.species === "dog") {
      setBreeds(dogBreeds);
    } else if (petData.species === "cat") {
      setBreeds(catBreeds);
    } else {
      setBreeds([]);
    }
  }, [petData.species]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file) {
        const imagePreviewUrl = URL.createObjectURL(file);
        setPetData({
          ...petData,
          image: file,
          imagePreviewUrl,
        });
      }
    } else {
      setPetData({ ...petData, [name]: value });
    }
  };

  // Handle form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageUrl = petData.imagePreviewUrl;

      // If a new image is uploaded, update it in storage
      if (petData.image && typeof petData.image !== "string") {
        const storage = getStorage();
        const storageRef = ref(storage, `pets/${petData.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, petData.image);
        await uploadTask;
        imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      // Prepare updated data
      const updatedData = {
        petName: petData.petName,
        birthdate: petData.birthdate,
        gender: petData.gender,
        species: petData.species === "other" ? petData.otherSpecies : petData.species,
        breed: (petData.breed === "other" || petData.species === "other") ? petData.otherBreed : petData.breed,
        weight: petData.weight,
        color: petData.color,
        image: imageUrl,
        existingConditions: petData.existingConditions || "None",
        allergies: petData.allergies || "None",
      };

      // Update pet data in Firestore
      const docRef = doc(db, "pets", petUid);
      await updateDoc(docRef, updatedData);

      toast.success("Pet updated successfully!");
      closeModal();
    } catch (error) {
      toast.error("Error updating pet. Please try again.");
    }finally{
      setIsLoading(false);
    }  
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 max-h-screen overflow-y-auto z-50">
        {/* Close Button */}
        <IoClose
          className="absolute top-2 right-2 text-2xl cursor-pointer"
          onClick={closeModal}
        />
  
        <h3 className="font-bold text-lg mb-4">Edit Pet</h3>
  
        <form onSubmit={handleUpdate}>
          {/* Pet Name */}
          <label className="block mb-2">Pet Name:</label>
          <input
            type="text"
            name="petName"
            className="input input-bordered w-full mb-4"
            value={petData.petName}
            onChange={handleInputChange}
          />
  
          {/* Birthdate */}
          <label className="block mb-2">Birthdate:</label>
          <input
            type="date"
            name="birthdate"
            className="input input-bordered w-full mb-4"
            value={petData.birthdate}
            onChange={handleInputChange}
          />
  
          {/* Gender */}
          <label className="block mb-2">Gender:</label>
          <select
            name="gender"
            className="input input-bordered w-full mb-4"
            value={petData.gender}
            onChange={handleInputChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
  
          {/* Species */}
          <label className="block mb-2">Species:</label>
          <select
            name="species"
            className="input input-bordered w-full mb-4"
            value={petData.species}
            onChange={handleInputChange}
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>
  
          {/* Breed or Other Species */}
          {breeds.length > 0 ? (
            <>
              <label className="block mb-2">Breed:</label>
              <select
                name="breed"
                className="input input-bordered w-full mb-4"
                value={petData.breed}
                onChange={handleInputChange}
              >
                {breeds.map((breed, index) => (
                  <option key={index} value={breed}>
                    {breed}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            </>
          ) : (
            <>
              <label className="block mb-2">Species (if other):</label>
              <input
                type="text"
                name="otherSpecies"
                className="input input-bordered w-full mb-4"
                placeholder="Enter species"
                value={petData.otherSpecies}
                onChange={handleInputChange}
              />
            </>
          )}
  
          {/* If "Other" is selected for breed */}
          {(petData.breed === "other" || petData.species === "other") && (
            <>
              <label className="block mb-2">Breed (if other):</label>
              <input
                type="text"
                name="otherBreed"
                className="input input-bordered w-full mb-4"
                placeholder="Please specify the breed"
                value={petData.otherBreed}
                onChange={handleInputChange}
              />
            </>
          )}
  
          {/* Weight */}
          <label className="block mb-2">Weight (kg):</label>
          <input
            type="number"
            name="weight"
            className="input input-bordered w-full mb-4"
            value={petData.weight}
            onChange={handleInputChange}
          />
  
          {/* Color */}
          <label className="block mb-2">Color:</label>
          <input
            type="text"
            name="color"
            className="input input-bordered w-full mb-4"
            value={petData.color}
            onChange={handleInputChange}
          />
  
          {/* Image Upload */}
          <label className="block mb-2">Image:</label>
          <input
            type="file"
            accept="image/*"
            name="image"
            onChange={handleInputChange}
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 mb-4"
          />
  
          {/* Image Preview */}
          {petData.imagePreviewUrl && (
            <>
              <label className="block mb-2">Image Preview:</label>
              <div className="mb-4">
                <img
                  src={petData.imagePreviewUrl}
                  alt="Image Preview"
                  className="w-full h-auto rounded-md"
                />
              </div>
            </>
          )}
  
          {/* Existing Conditions */}
          <label className="block mb-2">Existing Conditions:</label>
          <input
            type="text"
            name="existingConditions"
            className="input input-bordered w-full mb-4"
            placeholder="Leave it blank if none"
            value={petData.existingConditions}
            onChange={handleInputChange}
          />
  
          {/* Allergies */}
          <label className="block mb-2">Allergies:</label>
          <input
            type="text"
            name="allergies"
            className="input input-bordered w-full mb-4"
            placeholder="Leave it blank if none"
            value={petData.allergies}
            onChange={handleInputChange}
          />
  
          {/* Update Button */}
          <button type="submit" className="btn btn-primary w-full mt-4"
         disabled={isLoading}
          >
          {isLoading ? (
          <>
            <Spinner />
            Please wait...
          </>
        ) : (
          "Update Changes"
        )}
          </button>
        </form>
      </div>
    </div>
  );  
}

import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { dogBreeds, catBreeds } from "./breeds"; // Adjust the path as necessary

export default function OwnerAdoptionModalEdit({ uid, closeModal }) {
  const [petData, setPetData] = useState({
    petName: "",
    birthdate: "",
    gender: "male",
    species: "dog",
    breed: "",
    weight: "",
    color: "",
    image: null,
    imagePreviewUrl: "",
    notes: "",
  });
  const [breeds, setBreeds] = useState([]);

  // Fetch pet data from Firestore based on UID
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petDoc = await getDoc(doc(db, "adoptions", uid));
        if (petDoc.exists()) {
          const data = petDoc.data();
          setPetData({
            ...data,
            imagePreviewUrl: data.image || "",
          });
        } else {
          toast.error("Pet not found.");
          closeModal();
        }
      } catch (error) {
        console.error("Error fetching pet data:", error);
      }
    };
    fetchPetData();
  }, [uid, closeModal]);

  // Populate breeds based on species selection
  useEffect(() => {
    if (petData.species === "dog") {
      setBreeds(dogBreeds);
    } else if (petData.species === "cat") {
      setBreeds(catBreeds);
    } else {
      setBreeds([]); // No breed options for 'other'
    }
  }, [petData.species]);

  // Handle input changes and file selection for image
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setPetData({
          ...petData,
          image: file,
          imagePreviewUrl: URL.createObjectURL(file),
        });
      }
    } else {
      setPetData({ ...petData, [name]: value });
    }
  };

  // Update pet data in Firestore on form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = petData.imagePreviewUrl;

      // Upload new image if changed
      if (petData.image && petData.image instanceof File) {
        const storage = getStorage();
        const storageRef = ref(storage, `pets/${petData.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, petData.image);
        await uploadTask;
        imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      // Update Firestore with modified data
      await updateDoc(doc(db, "adoptions", uid), {
        ...petData,
        image: imageUrl,
      });

      toast.success("Pet information updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating pet data:", error);
      toast.error("Failed to update pet information.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 max-h-screen overflow-y-auto z-50">
        <IoClose
          className="absolute top-2 right-2 text-2xl cursor-pointer"
          onClick={closeModal}
        />
        <h3 className="font-bold text-lg">Edit Pet Information</h3>

        <form onSubmit={handleSubmit}>
          <label>Pet Name:</label>
          <input
            type="text"
            name="petName"
            className="input input-bordered w-full"
            required
            value={petData.petName}
            onChange={handleInputChange}
          />

          <label>Birthdate:</label>
          <input
            type="date"
            name="birthdate"
            className="input input-bordered w-full"
            required
            value={petData.birthdate}
            onChange={handleInputChange}
          />

          <label>Gender:</label>
          <select
            name="gender"
            className="input input-bordered w-full"
            value={petData.gender}
            onChange={handleInputChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label>Species:</label>
          <select
            name="species"
            className="input input-bordered w-full"
            value={petData.species}
            onChange={handleInputChange}
          >
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>

          {breeds.length > 0 ? (
            <>
              <label>Breed:</label>
              <select
                name="breed"
                className="input input-bordered w-full"
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
              <label>Other Species/Breed:</label>
              <input
                type="text"
                name="breed"
                className="input input-bordered w-full"
                placeholder="Enter species or breed"
                value={petData.breed}
                onChange={handleInputChange}
              />
            </>
          )}

          <label>Weight (kg):</label>
          <input
            type="text"
            name="weight"
            className="input input-bordered w-full"
            value={petData.weight}
            onChange={handleInputChange}
          />

          <label>Color:</label>
          <input
            type="text"
            name="color"
            className="input input-bordered w-full"
            value={petData.color}
            onChange={handleInputChange}
          />

          <label>Image:</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="input input-bordered w-full"
            onChange={handleInputChange}
          />

          {/* Display the selected or current image */}
          {petData.imagePreviewUrl && (
            <img
              src={petData.imagePreviewUrl}
              alt="Preview"
              className="mt-2 w-full h-auto"
            />
          )}

          <label>Adoption Notes:</label>
          <textarea
            name="notes"
            className="input input-bordered w-full h-24"
            placeholder="Enter adoption notes"
            value={petData.notes}
            onChange={handleInputChange}
          />

          <button type="submit" className="btn btn-primary mt-4">
            Update Changes
          </button>
        </form>
      </div>
    </div>
  );
}

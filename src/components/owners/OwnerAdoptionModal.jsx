import React, { useState, useEffect } from "react";
import { db } from "../../firebase"; // Firebase config
import { addDoc, collection } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

export default function OwnerAdoptionModal({
  clientId,
  projectId,
  clientName,
  closeModal,
}) {
  const [petData, setPetData] = useState({
    petName: "",
    birthdate: "",
    gender: "male",
    species: "dog",
    breed: "",
    weight: "",
    color: "",
    image: null,
    otherSpecies: "", // Add field for other species
    otherBreed: "", // Add field for other breed
    imagePreviewUrl: "", // For storing the preview URL
    notes: "", // New notes field
  });
  const [breeds, setBreeds] = useState([]);

  // Fetch breeds based on species selection
  useEffect(() => {
    if (petData.species === "dog") {
      setBreeds([
        "Afghan Hound",
        "Aspin",
        "Australian Cattle Dog",
        "Australian Shepherd",
        "Basenji",
        "Basset Hound",
        "Beagle",
        "Bernese Mountain Dog",
        "Boston Terrier",
        "Border Collie",
        "Boxer",
        "Brittany Spaniel",
        "Bulldog",
        "Dachshund",
        "Doberman Pinscher",
        "English Springer Spaniel",
        "German Shepherd",
        "German Shorthaired Pointer",
        "Golden Retriever",
        "Great Dane",
        "Havanese",
        "Labrador Retriever",
        "Mastiff",
        "Pembroke Welsh Corgi",
        "Pomeranian",
        "Poodle",
        "Rottweiler",
        "Shetland Sheepdog",
        "Shiba Inu",
        "Shih Tzu",
        "Siberian Husky",
        "Weimaraner",
        "Yorkshire Terrier",
      ]);
    } else if (petData.species === "cat") {
      setBreeds([
        "Abyssinian",
        "American Bobtail",
        "American Curl",
        "American Shorthair",
        "American Wirehair",
        "Asian Semi-longhair",
        "Australian Mist",
        "Balinese",
        "Bengal",
        "Birman",
        "Bombay",
        "British Longhair",
        "British Shorthair",
        "Burmese",
        "Burmilla",
        "California Spangled",
        "Chartreux",
        "Chausie",
        "Cheetoh",
        "Cornish Rex",
        "Cymric",
        "Devon Rex",
        "Donskoy",
        "Egyptian Mau",
        "Elf cat",
        "Exotic Shorthair",
        "Havana Brown",
        "Himalayan",
        "Japanese Bobtail",
        "Javanese",
        "Korat",
        "LaPerm",
        "Maine Coon",
        "Manx",
        "Munchkin",
        "Nebelung",
        "Norwegian Forest Cat",
        "Ocicat",
        "Oriental Shorthair",
        "Persian",
        "Pixie-bob",
        "Philippine Shorthair (Puspin)",
        "Ragamuffin",
        "Ragdoll",
        "Russian Blue",
        "Scottish Fold",
        "Selkirk Rex",
        "Siamese",
        "Siberian",
        "Singapura",
        "Snowshoe",
        "Somali",
        "Sphynx",
        "Tonkinese",
        "Turkish Angora",
        "Turkish Van",
      ]);
    } else {
      setBreeds([]); // No breed options for 'other'
    }
  }, [petData.species]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      if (file) {
        const imagePreviewUrl = URL.createObjectURL(file); // Generate a preview URL

        setPetData({
          ...petData,
          image: file,
          imagePreviewUrl, // Save the preview URL
        });
      }
    } else {
      // Update other text or select fields
      setPetData({
        ...petData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";

      // If there's an image, upload it
      if (petData.image) {
        const storage = getStorage();
        const storageRef = ref(storage, `pets/${petData.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, petData.image);
        await uploadTask;
        imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      // Prepare data for submission, replacing species and breed if 'other' is selected
      const finalData = {
        clientId: clientId,
        projectId: projectId,
        petName: petData.petName,
        birthdate: petData.birthdate,
        gender: petData.gender,
        species: petData.species === "other" ? petData.otherSpecies : petData.species, // Store other species in species field
        breed: (petData.breed === "other" || petData.species === "other") ? petData.otherBreed : petData.breed, // Store other breed in breed field
        weight: petData.weight,
        color: petData.color,
        image: imageUrl,
        notes: petData.notes || "No notes", // Add notes field
      };

      // Add pet data to Firestore
      await addDoc(collection(db, "adoptions"), finalData);

      toast.success("Pet added successfully!");
      closeModal(); // Close modal after successful submission
    } catch (error) {
      toast.error("Error adding pet. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-96 max-h-screen overflow-y-auto z-50">
        <IoClose
          className="absolute top-2 right-2 text-2xl cursor-pointer"
          onClick={closeModal}
        />
        <div>
          <h3 className="font-bold text-lg">Add Pet for {clientName}</h3>

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

            {petData.species === "dog" || petData.species === "cat" ? (
              <label>Breed:</label>
            ) : (
              <label>Species (if other):</label>
            )}
            {breeds.length > 0 ? (
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
            ) : (
              <input
                type="text"
                name="otherSpecies"
                className="input input-bordered w-full"
                placeholder="Enter species"
                value={petData.otherSpecies}
                onChange={handleInputChange}
              />
            )}

            {/* Conditionally render a text input if "Other" is selected */}
            {(petData.breed === "other" || petData.species === "other") && (
              <div>
                <label>
                  {petData.breed === "other"
                    ? "Breed (if other):"
                    : petData.species === "other"
                    ? "Breed"
                    : ""}
                </label>
                <input
                  type="text"
                  name="otherBreed"
                  className="input input-bordered w-full"
                  placeholder="Enter breed"
                  value={petData.otherBreed}
                  onChange={handleInputChange}
                />
              </div>
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

            {/* Preview the selected image */}
            {petData.imagePreviewUrl && (
              <img
                src={petData.imagePreviewUrl}
                alt="Preview"
                className="mt-2 w-full h-auto"
              />
            )}

            <label>Notes:</label>
            <textarea
              name="notes"
              className="input input-bordered w-full h-24"
              placeholder="Enter any notes about the pet"
              value={petData.notes}
              onChange={handleInputChange}
            />

            <button type="submit" className="btn btn-primary mt-4">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

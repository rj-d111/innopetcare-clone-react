import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useParams } from "react-router";
import { db } from "../../../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

const PetSidebar = ({ onPetSelect }) => {
  const { id } = useParams(); // Get projectId from URL
  const [pets, setPets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All"); // Filter type: All, Dog, Cat, Others
  const [selectedPet, setSelectedPet] = useState(null); // Track the selected pet

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const petsCollectionRef = collection(db, "pets");
        const petsQuery = query(
          petsCollectionRef,
          where("projectId", "==", id),
          orderBy("petName", "asc")
        );
        const querySnapshot = await getDocs(petsQuery);
        const petsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPets(petsList);
      } catch (error) {
        console.error("Error fetching pets: ", error);
      }
    };

    fetchPets();
  }, [id]);

  // Handle search and filtering
  const filteredPets = pets.filter((pet) => {
    const matchesSearch = pet.petName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "All" ||
      (filterType === "Dog" && pet.species.toLowerCase() === "dog") ||
      (filterType === "Cat" && pet.species.toLowerCase() === "cat") ||
      (filterType === "Others" && !["dog", "cat"].includes(pet.species.toLowerCase()));

    return matchesSearch && matchesFilter;
  });

  // Handle pet click
  const handlePetClick = (pet) => {
    setSelectedPet(pet); // Update selected pet
    onPetSelect(pet); // Pass the pet information to the parent component
  };

  return (
    <div className="w-1/3 bg-gray-100 p-4">
      <h2 className="text-lg font-bold mb-4">Pet Name List</h2>
      <div className="join">
        <input
          className="input input-bordered join-item"
          placeholder="Search pet"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn join-item bg-yellow-500 hover:bg-yellow-600 rounded-r-full">
          <FaSearch />
        </button>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 my-4">
        <button
          className={`btn ${filterType === "All" ? "btn-accent" : "btn-outline"}`}
          onClick={() => setFilterType("All")}
        >
          All
        </button>
        <button
          className={`btn ${filterType === "Dog" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilterType("Dog")}
        >
          Dog
        </button>
        <button
          className={`btn ${filterType === "Cat" ? "btn-secondary" : "btn-outline"}`}
          onClick={() => setFilterType("Cat")}
        >
          Cat
        </button>
        <button
          className={`btn ${filterType === "Others" ? "btn-outline" : "btn-outline"}`}
          onClick={() => setFilterType("Others")}
        >
          Others
        </button>
      </div>

      <ul className="list-none mt-4 overflow-auto h-96">
        {filteredPets.length > 0 ? (
          filteredPets.map((pet) => (
            <li key={pet.id} className="mb-2">
              <button
                className={`block p-2 rounded w-full text-left ${
                  selectedPet?.id === pet.id
                    ? "bg-gray-300"
                    : "bg-blue-100 hover:bg-gray-200"
                }`}
                onClick={() => handlePetClick(pet)} // Handle pet selection
              >
                {pet.petName}
              </button>
            </li>
          ))
        ) : (
          <p>No pets found.</p>
        )}
      </ul>
    </div>
  );
};

export default PetSidebar;

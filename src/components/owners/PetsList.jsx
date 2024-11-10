import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { IoMdFemale, IoMdMale } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

export default function PetsList({
  clientId,
  showFilters = false,
  limit = 0,
  slug = "",
  isClient = false,
}) {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [speciesFilter, setSpeciesFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch pets associated with the client
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const petsCollection = collection(db, "pets");
        const q = query(petsCollection, where("clientId", "==", clientId));
        const querySnapshot = await getDocs(q);
        const petsData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setPets(petsData);
        setFilteredPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    };
    fetchPets();
  }, [clientId]);

  // Filter pets by species and search query
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = pets.filter(
      (pet) =>
        (speciesFilter === "" || pet.species === speciesFilter) &&
        (pet.petName.toLowerCase().includes(lowercasedQuery) ||
          pet.breed.toLowerCase().includes(lowercasedQuery))
    );
    setFilteredPets(filtered);
  }, [speciesFilter, searchQuery, pets]);

  // Limit the number of pets displayed if the limit prop is provided
  const displayedPets = limit > 0 ? filteredPets.slice(0, limit) : filteredPets;

  return (
    <div>
      {/* Filter and Search Bar (conditionally rendered) */}
      {showFilters && (
  <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mb-4">
    {/* Filter Buttons */}
    <div className="flex flex-wrap justify-center md:justify-start gap-2">
      <button onClick={() => setSpeciesFilter("")} className="btn btn-sm">
        All
      </button>
      <button onClick={() => setSpeciesFilter("dog")} className="btn btn-sm">
        Dog
      </button>
      <button onClick={() => setSpeciesFilter("cat")} className="btn btn-sm">
        Cat
      </button>
      <div className="dropdown dropdown-hover">
        <button tabIndex="0" className="btn btn-sm">
          Others
        </button>
        <ul
          tabIndex="0"
          className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-30"
        >
          <li>
            <button onClick={() => setSpeciesFilter("rabbit")}>Rabbit</button>
          </li>
          <li>
            <button onClick={() => setSpeciesFilter("bird")}>Bird</button>
          </li>
        </ul>
      </div>
    </div>

    {/* Search Bar */}
    <div className="flex w-full md:w-auto justify-center md:justify-end gap-2">
      <input
        className="input input-bordered w-full md:w-60"
        placeholder="Search by pet name or breed"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button className="btn rounded-r-lg">
        <FaSearch />
      </button>
    </div>
  </div>
)}


      {/* Pets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPets.length > 0 ? (
          displayedPets.map((pet) => (
            <div
              key={pet.id}
              className="card bg-white shadow-md p-4 rounded-lg"
            >
              <div className="avatar flex justify-center mb-4">
                <div className="mask mask-squircle w-24 h-24">
                  <img src={pet.image} alt={pet.petName} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center">
                {pet.petName}{" "}
                {pet.gender === "male" ? (
                  <IoMdMale className="inline text-blue-500" />
                ) : (
                  <IoMdFemale className="inline text-pink-500" />
                )}
              </h3>
              <p className="text-center text-gray-600">
                <strong>Species:</strong> {pet.species}
              </p>
              <p className="text-center text-gray-600">
                <strong>Breed:</strong> {pet.breed}
              </p>
              <div className="text-center mt-4">
                <button
                  onClick={() =>
                    navigate(
                      isClient
                        ? `/sites/${slug}/dashboard/pets/${pet.id}`
                        : `${pet.id}`,
                      { state: { pet } } // Pass the entire pet object as state
                    )
                  }
                  className="btn btn-outline btn-sm"
                >
                  More Details &gt;
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full">
            No pets found for this owner.
          </p>
        )}
      </div>
    </div>
  );
}

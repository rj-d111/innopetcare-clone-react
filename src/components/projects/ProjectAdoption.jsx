import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { FaSearch } from "react-icons/fa";
import { MdViewList, MdViewModule } from "react-icons/md";
import Spinner from "../Spinner";
import Footer from "../Footer";
import ProjectFooter from "./ProjectFooter";
import { useParams } from "react-router";

export default function ProjectAdoption() {
  const { slug } = useParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [filteredPets, setFilteredPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [headerColor, setHeaderColor] = useState("#FF0000"); // Default color (e.g., red)

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    // Fetch pets dynamically with real-time updates
    const globalSectionsQuery = query(
      collection(db, "global-sections"),
      where("slug", "==", slug)
    );

    const unsubscribeGlobalSections = onSnapshot(
      globalSectionsQuery,
      (globalSectionsSnapshot) => {
        if (!globalSectionsSnapshot.empty) {
          const globalSectionData = globalSectionsSnapshot.docs[0].data();
          const projectId = globalSectionsSnapshot.docs[0].id;

          // Set headerColor from global-sections data
          if (globalSectionData.headerColor) {
            setHeaderColor(globalSectionData.headerColor);
          }

          const animalsRef = collection(db, `adoptions/${projectId}/animals`);
          const animalsQuery = query(animalsRef);

          const unsubscribeAnimals = onSnapshot(
            animalsQuery,
            (animalsSnapshot) => {
              const pets = animalsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));

              // Filter out archived pets
              const filteredPets = pets.filter(
                (pet) => !pet.isArchive || pet.isArchive === false
              );

              setFilteredPets(filteredPets);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching pets: ", error);
              setLoading(false);
            }
          );

          // Cleanup for animals listener
          return () => unsubscribeAnimals();
        } else {
          setFilteredPets([]);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching global sections: ", error);
        setLoading(false);
      }
    );

    // Cleanup for global sections listener
    return () => unsubscribeGlobalSections();
  }, [slug]);

  // Map button labels to the actual species values in your database
  const categoryMapping = {
    All: "all",
    Cats: "cat",
    Dogs: "dog",
    Others: "others",
  };

  // Filter pets by category (Cats, Dogs, Others, All) and search query
  const filteredPetsByCategory = filteredPets.filter((pet) => {
    const species = pet.species?.toLowerCase().trim();
    const selectedCategory = categoryMapping[activeCategory];

    const categoryMatch =
      selectedCategory === "all" ||
      species === selectedCategory ||
      (selectedCategory === "others" && !["cat", "dog"].includes(species));

    const searchMatch =
      searchQuery === "" ||
      pet.petName.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="bg-gray-600 md:min-h-[calc(100vh-64px)]">
        <div className="mx-auto text-center p-10">
          <h1 className="text-white text-4xl font-bold mb-2">
            Adopt, don’t shop
          </h1>
          <p className="text-white text-lg mb-6">
            These loving pets need a new home.
          </p>

          {/* Filters and Search Bar */}
          <div className="flex justify-between items-center mb-8">
            {/* Category Buttons */}
            <div className="flex space-x-4">
              {["All", "Cats", "Dogs", "Others"].map((category) => (
                <button
                  key={category}
                  className={`btn px-6 py-2 font-semibold rounded ${
                    activeCategory === category ? "" : "bg-white text-black"
                  }`}
                  style={
                    activeCategory === category
                      ? { backgroundColor: headerColor, color: "white", borderColor: headerColor}
                      : {}
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search Bar and View Toggle */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  className="input input-bordered w-72"
                  placeholder="Search pets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="absolute right-0 top-0 bottom-0 px-4 rounded-r"
                  style={{ backgroundColor: headerColor, color: "white" }}
                >
                  <FaSearch />
                </button>
              </div>

              {/* View Toggle Button */}
              <button
                className="btn px-4 py-2 rounded"
                style={{ backgroundColor: headerColor, color: "white", borderColor: headerColor }}
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
              >
                {viewMode === "grid" ? (
                  <MdViewList size={24} />
                ) : (
                  <MdViewModule size={24} />
                )}
              </button>
            </div>
          </div>

          {/* Display Pets */}
          {filteredPetsByCategory.length > 0 ? (
            <div
              className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "space-y-6"
              }`}
            >
      {filteredPetsByCategory.map((pet) => (
  <div
    key={pet.id}
    className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-between"
  >
    {/* Pet Image */}
    <img
      src={pet.image}
      alt={pet.petName}
      className="w-full h-48 object-cover rounded-t-lg mb-4 select-none"
    />

    {/* Pet Name */}
    <h2
      className="text-xl font-semibold text-center mb-2"
      style={{ color: headerColor }}
    >
      {pet.petName}       {/* Gender Symbol */}
      <span className={`ps-1 text-lg font-black ${pet.gender === "male" ? "text-blue-500" : "text-pink-500"}`}>
        {pet.gender === "male" ? "♂" : "♀"}
      </span>
    </h2>

    {/* Gender Icon and Breed */}
    <div className="text-gray-600 text-center mb-4 flex items-center justify-center gap-2">

      {/* Breed */}
      <span className="text-sm">{pet.breed}</span>
    </div>

    {/* Learn About Me Button */}
    <button
      onClick={() =>
        (window.location.href = `/sites/${slug}/adopt-pet/${pet.id}`)
      }
      className="btn w-full py-3 font-semibold rounded-lg transition"
      style={{
        backgroundColor: headerColor,
        color: "white",
        borderColor: headerColor,
      }}
    >
      Learn about me
    </button>
  </div>
))}

            </div>
          ) : (
            <div className="text-white text-center mt-10">
              <p className="text-2xl font-semibold">
                No pets found matching your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
      <ProjectFooter />
    </>
  );
}

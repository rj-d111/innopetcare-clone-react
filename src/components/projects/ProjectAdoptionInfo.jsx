import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Make sure this is your Firebase configuration
import { FaFileDownload } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import Spinner from "../Spinner";
import PetAdoptionForm from "../../assets/pdf/PetAdoptionForm_SampleByInnoPetCare.pdf";
import AnimalAdoptionRecords from "../owners/records/AnimalAdoptionRecords";

export default function ProjectAdoptionInfo() {
  const { slug, id } = useParams(); // id = petId, slug = project slug
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [adoptFileUrl, setAdoptFileUrl] = useState(null); // State for adopt file URL

  const handleAdoptionInquiry = () => {
    navigate(`/sites/${slug}/messages`);
  };

  const handleDownloadForm = () => {
    if (!adoptFileUrl) {
      console.error("Adoption form URL not available.");
      return;
    }
  
    // Extract the filename from the adoptFileUrl
    const urlParts = adoptFileUrl.split("/");
    const fileName = urlParts[urlParts.length - 1].split("?")[0]; // Extracts filename before query parameters
  
    const link = document.createElement("a");
    link.href = adoptFileUrl;
    link.download = fileName; // Dynamically use the filename from the URL
    link.click();
  };
  

 useEffect(() => {
    const fetchPetDetails = async () => {
      try {
        const db = getFirestore();

        // Fetch projectId using slug
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const fetchedProjectId = globalSectionsSnapshot.docs[0].id;
          setProjectId(fetchedProjectId);

          // Fetch pet details from animals subcollection
          const petRef = doc(db, `adoptions/${fetchedProjectId}/animals`, id);
          const petSnap = await getDoc(petRef);

          if (petSnap.exists()) {
            setPet(petSnap.data());
          } else {
            console.log("No such document!");
          }

          // Fetch the adopt form file URL from adopt-sections collection
          const adoptFormRef = doc(db, `adopt-sections/${fetchedProjectId}`);
          const adoptFormSnap = await getDoc(adoptFormRef);

          if (adoptFormSnap.exists()) {
            setAdoptFileUrl(adoptFormSnap.data().adoptFile);
          } else {
            console.error("Adoption form not found.");
          }
        } else {
          console.error("Project not found for the given slug.");
        }
      } catch (error) {
        console.error("Error fetching pet details:", error);
      }
    };

    fetchPetDetails();
  }, [slug, id]);

  if (!pet) {
    return <Spinner />;
  }


  // Format birthdate to show age
  const calculateAge = (birthdate) => {
    const birthDateObj = new Date(birthdate);
    const diff = Date.now() - birthDateObj.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970); // Calculate age in years
  };

  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center justify-start">
      {/* Main Content Section */}
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6 md:flex print:shadow-none mb-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm mb-4 md:mb-0 print:hidden"
        >
          &lt; BACK
        </button>
  
        {/* Image Section */}
        <div className="md:w-1/3 flex justify-center md:justify-start">
          <img
            src={pet.image}
            alt={pet.petName}
            className="rounded-full w-48 h-48 object-cover border-4 border-white shadow-md select-none"
          />
        </div>
  
        {/* Pet Details Section */}
        <div className="md:w-2/3 md:ml-6">
          <h2 className="text-4xl font-bold text-black py-2">{pet.petName}</h2>
          <p className="text-gray-700 mt-2">
            <span className="font-bold">Gender: </span>
            {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Age: </span>
            {calculateAge(pet.birthdate)} years old
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Color: </span>
            {pet.color.charAt(0).toUpperCase() + pet.color.slice(1)}
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Breed: </span>
            {pet.breed}
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Weight: </span>
            {pet.weight} kg
          </p>
          <p className="text-gray-700">
            <span className="font-bold">Description: </span>
            <p className="text-justify leading-relaxed">{pet.description}</p>
          </p>
          <p className="text-gray-700 mt-4">{pet.notes}</p>
  
          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-6 items-center print:hidden">
            {/* Adoption Inquiry Button */}
            <button
              onClick={handleAdoptionInquiry}
              className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
            >
              <AiFillMessage className="mr-2" /> ADOPTION INQUIRY
            </button>
  
            {/* Download Adoption Form Button */}
            <button
              onClick={handleDownloadForm}
              className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
            >
              <FaFileDownload className="mr-2" /> DOWNLOAD ADOPTION FORM
            </button>
          </div>
        </div>
      </div>
  
      {/* Records Section */}
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-6">
        <AnimalAdoptionRecords
          petUid={id}
          projectId={projectId}
          isClient={true}
        />
      </div>
    </div>
  );
  
}

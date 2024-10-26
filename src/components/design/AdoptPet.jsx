import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  addDoc,
  doc, // Import doc for getting single document reference
  getDoc, // Import getDoc to fetch a single document
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../../firebase";

export default function AdoptPet() {
  const { id } = useParams();
  
  const [isEnabled, setIsEnabled] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isTypeAnimalShelter, setIsTypeAnimalShelter] = useState(false); // Track if project type is "Animal Shelter Site"
  const [adoptPetInto, setadoptPetInto] = useState({
    isEnabled: true,
  });

  useEffect(() => {
    // Fetch project type based on projectId from URL
    const fetchProjectDetails = async () => {
      const projectDocRef = doc(db, "projects", id); // Fetch the project by id
      const projectDocSnap = await getDoc(projectDocRef);
  
      if (projectDocSnap.exists()) {
        const projectData = projectDocSnap.data();
  
        if (projectData.type === "Animal Shelter Site") {
          setIsEnabled(true); // Automatically enable the button
          setIsTypeAnimalShelter(true); // Disable the toggle for Animal Shelter Site type
  
          // Check if the 'adopt-pet-page' document already exists
          const q = query(
            collection(db, "adopt-pet-page"),
            where("projectId", "==", id)
          );
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            // Document exists, update it to ensure isEnabled is true
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, { isEnabled: true });
          } else {
            // Document doesn't exist, create it with isEnabled: true
            await addDoc(collection(db, "adopt-pet-page"), {
              projectId: id,
              isEnabled: true, // Automatically set to true for Animal Shelter Site
            });
            setIsUpdateMode(true); // Switch to update mode
          }
        } else {
          // Fetch existing adopt-pet-page data if the project is not an Animal Shelter Site
          const q = query(
            collection(db, "adopt-pet-page"),
            where("projectId", "==", id)
          );
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data();
            setadoptPetInto(docData);
            setIsEnabled(docData.isEnabled); // Set enabled state based on fetched data
            setIsUpdateMode(true); // Switch to update mode
          }
        }
      } else {
        toast.error("Project not found.");
      }
    };
  
    fetchProjectDetails();
  }, [id]);
  

  const toggleAdoptPetPage = async () => {
    // Prevent toggling if type is "Animal Shelter Site"
    if (isTypeAnimalShelter) {
      return; // Don't allow toggling if type is "Animal Shelter Site"
    }

    const newState = !isEnabled;
    setIsEnabled(newState);
    setadoptPetInto({ isEnabled: newState }); // Update adoptPetInto state
    toast.success(`Your adopt pet page is now ${newState ? "enabled" : "disabled"}`);

    if (isUpdateMode) {
      const q = query(
        collection(db, "adopt-pet-page"),
        where("projectId", "==", id)
      );
      const querySnapshot = await getDocs(q);
      const docRef = querySnapshot.docs[0].ref; // Get the reference of the first matching document

      await updateDoc(docRef, { isEnabled: newState }); // Update the isEnabled field
    } else {
      await addDoc(collection(db, "adopt-pet-page"), {
        ...adoptPetInto,
        projectId: id, // Foreign key linking to the project
      });
      setIsUpdateMode(true); // Switch to update mode after saving
    }
  };

  return (
    <>
      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-screen">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Adopt Pet Page</h2>
          <p className="text-sm text-gray-700">
          An adopt pet page is a section of a website dedicated to connecting potential pet owners with animals in need of homes.          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="toggle toggle-warning"
            checked={isEnabled}
            onChange={toggleAdoptPetPage} // Toggles the state
            disabled={isTypeAnimalShelter} // Disable toggle if type is "Animal Shelter Site"
          />
          <p className="ml-2">
            {isTypeAnimalShelter
              ? "Adopt Pet Page is automatically enabled for Animal Shelter Site"
              : "Enable Adopt Pet Page"}
          </p>
        </div>
      </div>
    </>
  );
}

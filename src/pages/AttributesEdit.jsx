import React from 'react';
import { collection, getDocs, doc, updateDoc, deleteField, addDoc, setDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path to your Firebase config
import PetAdoptionForm from "../assets/pdf/PetAdoptionForm_SampleByInnoPetCare.pdf"
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

export default function AttributesEdit() {
  const generateProjectIds = async () => {
    try {
      const projectsRef = collection(db, "projects"); // Reference to the 'projects' collection
      const snapshot = await getDocs(projectsRef); // Fetch all documents

      // Extract doc.id for each document
      const projectIds = [];
      snapshot.forEach((doc) => {
        projectIds.push(doc.id);
      });

      // Display or log the IDs
      console.log("Project IDs:", projectIds);

      // Optional: Do something with the IDs (e.g., store in state or pass to another function)
      alert(`Generated Project IDs: ${projectIds.join(", ")}`);
    } catch (error) {
      console.error("Error fetching project IDs:", error);
    }
  };


  const uploadDumpFile = async () => {
    try {
      const storage = getStorage(); // Storage instance

      // Create a reference for the file in Firebase Storage
      const storageRef = ref(storage, `adopt-sections/${Date.now()}_PetAdoptionForm.pdf`);

      // Fetch the file as a blob
      const response = await fetch(PetAdoptionForm);
      const fileBlob = await response.blob();

      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, fileBlob);

      // Get the download URL of the uploaded file
      const fileURL = await getDownloadURL(storageRef);

      // Save the file URL in Firestore
      const docRef = await addDoc(collection(db, "adopt-sections"), {
        adoptFile: fileURL,
        uploadedAt: new Date(),
      });

      console.log("File uploaded and saved with ID:", docRef.id);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("File upload failed!");
    }
  };

  const ids = [
    "4jDgGh4QCHbsHgXw7VUA",
    "6k6a8faF6IeWrQTnqmJc",
    "7Lk9qYdvfCzXJX8mLqYF",
    "7jgJTwKMtCRwBGThNlIa",
    "7ylad1mnTjfJSicwyKfC",
    "9urLyJzMHTU2lLfSIeW3",
    "AMpHsWGL9GzorxGOggf8",
    "AlulLhf31lspoiMpH3aw",
    "DE9nAti4nRm9bfTzAY6F",
    "DxObwDcSLMH2eSkMPKJn",
    "GPlKndkWxXChay6zjZsN",
    "HnwWYPFz2pfuVGGUMNcS",
    "IAAv9H53gQtJBVK1kGn7",
    "J8zkkQN1LFEWvOeirEuY",
    "Ps9vZcSXTsIa19gy5Voz",
    "Q9Ke3pcs03JQ1uSXB3rw",
    "RBnFmVBA3uUO2W5OeTZt",
    "RMwizU0qOFjTsZgGB6gT",
    "SfkFRxvVu90ulbnrmSVM",
    "Tqzxt11awl4DoxNo7a32",
    "Wnyo3GOh8tnap0DgqoVZ",
    "cGjyYIxB42ulUMdQF8s1",
    "cUIXak6obBGEPe09WL12",
    "cXlXjE8NWaKctgcROglD",
    "dt1eOWAOY7fc7SSonxK9",
    "dvQrGWQuzvQz4y71vN8M",
    "hLy61yoCcNU72D4nq3TG",
    "hUCd9IO24sRh3fpR5m3Q",
    "iDhcrOBdYBF9TWJ8QrtA",
    "j8ZgQ49pXfwEGtQrW7Ta",
    "mx8ZFq781ncHlC6kMn1e",
    "s2YXL4xErIrj5HpRCmM2",
    "wvSXDFzJ0NpLRc1PhljD",
    "xVLMapefUSmu7PNzZuxX"
  ];
  
  

  const bulkAddingIds = async () => {

    try {
      const batchPromises = ids.map(async (id) => {
        const docRef = doc(db, "community-forum-section", id);
        await setDoc(docRef, {
          isEnabled: true,
          updatedAt: Timestamp.now(),
        });
      });

      // Wait for all promises to resolve
      await Promise.all(batchPromises);

      console.log("All documents have been uploaded!");
      alert("Documents uploaded successfully!");
    } catch (error) {
      console.error("Error uploading documents:", error);
      alert("Error uploading documents!");
    }
  };

  const addAttributeAdoptions = async () => {
    try {
      const adoptionsCollection = collection(db, "adoptions");
      const querySnapshot = await getDocs(adoptionsCollection);

      // Iterate over all documents
      const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();

        // Check if isArchived field exists, if not or it is undefined, set it to false
        if (data.isArchived === undefined) {
          const docRef = doc(db, "adoptions", docSnapshot.id);
          await updateDoc(docRef, { isArchive: false });
          console.log(`Updated document ${docSnapshot.id} with isArchived: false`);
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);
      alert("All sections updated successfully!");
    } catch (error) {
      console.error("Error updating adoptions:", error);
      alert("Failed to update sections.");
    }
  };

  const removeIsArchivedAttribute = async () => {
    try {
      const adoptionsCollection = collection(db, "adoptions");
      const querySnapshot = await getDocs(adoptionsCollection);

      // Iterate over all documents
      const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
        const docRef = doc(db, "adoptions", docSnapshot.id);

        // Remove the isArchived field by setting it to null
        await updateDoc(docRef, { isArchived: null });
        console.log(`Removed isArchived attribute from document ${docSnapshot.id}`);
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);
      alert("isArchived attribute removed from all sections successfully!");
    } catch (error) {
      console.error("Error removing isArchived attribute:", error);
      alert("Failed to remove isArchived attribute.");
    }
  };

  const extractAdoptionPets = async () => {
    try {
      // Reference the 'adoptions' collection
      const adoptionsCollection = collection(db, "adoptions");

      // Fetch all documents from the collection
      const snapshot = await getDocs(adoptionsCollection);

      // Loop through each document and log the data
      snapshot.forEach((doc) => {
        console.log(`Document ID: ${doc.id}`, doc.data());
      });
    } catch (error) {
      console.error("Error fetching adoptions data:", error);
    }
  };

  const restructureAdoptions = async () => {  
    try {
      // Reference the 'adoptions' collection
      const adoptionsCollection = collection(db, "adoptions");
  
      // Fetch all documents in the 'adoptions' collection
      const snapshot = await getDocs(adoptionsCollection);
  
      snapshot.forEach(async (docSnapshot) => {
        const data = docSnapshot.data();
  
        // Extract the projectId
        const projectId = data.projectId;
  
        if (!projectId) {
          console.error(`Document ${docSnapshot.id} does not have a projectId.`);
          return;
        }
  
        // Create a reference to the subcollection 'animals' under the projectId
        const animalDocRef = doc(db, `adoptions/${projectId}/animals`, docSnapshot.id);
  
        // Remove the projectId field from the data to avoid redundancy in the 'animals' document
        const { projectId: _, ...animalData } = data;
  
        // Write the remaining data to the new 'animals' document
        await setDoc(animalDocRef, animalData);
  
        console.log(`Moved data for animal ${docSnapshot.id} to /adoptions/${projectId}/animals`);
      });
    } catch (error) {
      console.error("Error restructuring data:", error);
    }
  };

  const sampleNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Sample Notification", {
        body: "This is a sample notification!",
        icon: "path_to_icon.png", // Optional: Add a custom icon
      });
    } else if (Notification.permission !== "denied") {
      // Ask for permission if not already granted or denied
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Sample Notification", {
            body: "This is a sample notification!",
            icon: "path_to_icon.png", // Optional: Add a custom icon
          });
        }
      });
    } else {
      alert("Permission for notifications has been denied.");
    }
  };

  return (
    <div>
      <button className="btn btn-primary" onClick={sampleNotification}>
        Sample Notification
      </button>
    </div>
  );
}
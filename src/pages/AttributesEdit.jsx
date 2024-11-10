import React from 'react';
import { collection, getDocs, doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase"; // Adjust the path to your Firebase config

export default function AttributesEdit() {
  async function generateServicesTable() {
    try {
      const clientsCollection = collection(db, "clients");
      const snapshot = await getDocs(clientsCollection);

      snapshot.forEach(async (clientDoc) => {
        const clientRef = doc(db, "clients", clientDoc.id);
        const clientData = clientDoc.data();

        // Prepare the update object
        const updateData = {
          status: "approved", // Add or update the status attribute
        };

        // Conditionally remove `lastLoginTime` and `isApproved` attributes if they exist
        if ("lastLoginTime" in clientData) updateData.lastLoginTime = deleteField();
        if ("isApproved" in clientData) updateData.isApproved = deleteField();

        // Rename `timestamp` to `accountCreated` if it exists
        if ("timestamp" in clientData) {
          updateData.accountCreated = clientData.timestamp; // Copy the timestamp value to accountCreated
          updateData.timestamp = deleteField(); // Remove the old timestamp field
        }

        // Update the document
        await updateDoc(clientRef, updateData);
      });

      console.log("Status attribute added, `timestamp` renamed to `accountCreated`, and unnecessary attributes removed where found.");
    } catch (error) {
      console.error("Error updating clients:", error);
    }
  }

  
  return (
    <div>
      <button className="btn btn-primary" onClick={generateServicesTable}>
        Add status attribute to clients table
      </button>
    </div>
  );
}

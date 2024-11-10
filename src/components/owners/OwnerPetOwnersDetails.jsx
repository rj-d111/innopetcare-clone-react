import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import PetsList from "./PetsList";

export default function OwnerPetOwnersDetails() {
  const { ownerId } = useParams();
  const [ownerDetails, setOwnerDetails] = useState(null);

  // Fetch owner details
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const docRef = doc(db, "clients", ownerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOwnerDetails({ ...docSnap.data(), id: docSnap.id });
        } else {
          console.error("Owner not found");
        }
      } catch (error) {
        console.error("Error fetching owner details:", error);
      }
    };
    fetchOwnerDetails();
  }, [ownerId]);

  return (
    <div className="p-6">
      {/* Owner Details */}
      {ownerDetails && (
        <div className="mb-6">
          <h2 className="text-3xl font-semibold">{ownerDetails.name}</h2>
          <p><strong>Email:</strong> {ownerDetails.email}</p>
          <p><strong>Phone:</strong> {ownerDetails.phone}</p>
          <p>
            <strong>Joined:</strong>{" "}
            {format(new Date(ownerDetails.accountCreated.seconds * 1000), "MMMM d, yyyy 'at' hh:mm a")}
          </p>
        </div>
      )}

      {/* Pets List Component */}
      <PetsList clientId={ownerId} showFilters={true} />
      </div>
  );
}

import React from "react";
import { useParams, useLocation } from "react-router";
import PetInformation from "../owners/records/PetInformation";

export default function ProjectPetsDetails() {
  const { slug, petId } = useParams();
  const location = useLocation();
  const pet = location.state?.pet; // Access the pet object passed via state

  return (
    <>
    <div className="md:p-10 py-10 px-3">
        <h1 className="text-4xl font-bold">Pet Details</h1>
        <PetInformation pet={pet} petUid={petId} isClient={true} />
    </div>
    </>
  );
}

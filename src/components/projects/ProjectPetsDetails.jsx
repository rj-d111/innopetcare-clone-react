import React from "react";
import { useParams, useLocation } from "react-router";
import PetInformation from "../owners/records/PetInformation";
import PetRecords from "../owners/records/PetRecords";

export default function ProjectPetsDetails() {
  const { petId } = useParams();
  const location = useLocation();
  const pet = location.state?.pet; // Access the pet object passed via state


  return (
    <>
    <div className="md:p-10 py-10 px-3">
        <h1 className="text-4xl font-bold">Pet Details</h1>
        <PetInformation pet={pet} petUid={petId} isClient={true} />
        <PetRecords petUid={petId} projectId={pet.projectId} isClient={true}/>
    </div>
    </>
  );
}
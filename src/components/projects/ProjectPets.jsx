import React from "react";
import PetsList from "../owners/PetsList";
import { useParams } from "react-router";
import { getAuth } from "firebase/auth";

export default function ProjectPets() {
  const { slug } = useParams();
  const auth = getAuth();
  const user = auth.currentUser;
  const ownerId = user.uid;
  return (
    <div className="p-10 mx-auto">
      <PetsList
        clientId={ownerId}
        showFilters={true}
        slug={slug}
        isClient={true}
      />
    </div>
  );
}

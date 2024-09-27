import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import { useNavigate } from "react-router";

export default function ProjectOAuth() {
    const navigate = useNavigate();
    const [projectId, setProjectId] = useState(null);
    
    const pathname = window.location.href;
    const parts = pathname.split("sites/");
    const slug = parts[1].split("/")[0]; // Extract slug from URL
    
    // Fetch projectId from the 'global-sections' table based on the slug
    useEffect(() => {
      async function fetchProjectId() {
        if (slug) {
          try {
            // Query the collection where slug field matches the value
            const q = query(collection(db, "global-sections"), where("slug", "==", slug));
    
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
              // Since 'slug' should be unique, assume there is only one document
              const doc = querySnapshot.docs[0];
              const globalSectionData = doc.data();
              setProjectId(globalSectionData.projectId); // Extract and set projectId
            } else {
              console.log("No document found for the given slug in 'global-sections'");
            }
          } catch (error) {
            console.error("Error fetching projectId: ", error);
          }
        }
      }
    
      fetchProjectId();
    }, [slug]); // Re-run the effect whenever the slug changes
  async function onGoogleClick() {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(user);

      // Check if the user already exists
      const docRef = doc(db, "clients", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create a new user document if not found
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          phone: user.phoneNumber,
          timestamp: serverTimestamp(),
          isVerified: user.emailVerified,
          projectId: projectId, // Use the fetched projectId
        });
        toast.success("Success! Your account has been created!");
      } else {
        // User already exists
        const userData = docSnap.data();
        toast.success(`Successfully logged in! Hello ${userData.name}!`);
      }

      // Navigate to appointments or home after login
      navigate(`/sites/${slug}/appointments`);
    } catch (error) {
      toast.error("Could not authorize with Google");
    }
  }

  return (
    <button
      type="button"
      onClick={onGoogleClick}
      className="flex items-center justify-center w-full bg-red-700 text-white uppercase text-sm font-medium hover:bg-red-800 active:bg-red-900 py-3 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg active:shadow-lg"
    >
      <FcGoogle className="text-2xl bg-white rounded-full mr-2" />
      Continue with Google
    </button>
  );
}

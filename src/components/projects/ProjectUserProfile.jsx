import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { updateProfile } from "firebase/auth";

export default function ProjectUserProfile() {
  const [clientInfo, setClientInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  const fetchClientInfo = async () => {
    try {
      const clientDoc = await getDoc(doc(db, "clients", user.uid));
      if (clientDoc.exists()) {
        setClientInfo(clientDoc.data());
      } else {
        const userQuery = query(
          collection(db, "clients"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          const userDataFromQuery = querySnapshot.docs[0].data();
          setClientInfo(userDataFromQuery);
        } else {
          console.log("No user document found for the given UID in query.");
          setClientInfo(null);
        }
      }
    } catch (error) {
      console.error("Error fetching client info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const userUid = auth.currentUser.uid;
      const userDocRef = doc(db, "clients", userUid);

      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        await updateDoc(userDocRef, {
          name: clientInfo.name,
          phone: clientInfo.phone,
        });
        toast.success("Profile updated successfully");
      } else {
        const userQuery = query(
          collection(db, "clients"),
          where("uid", "==", userUid)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const existingDocRef = querySnapshot.docs[0].ref;
          await updateDoc(existingDocRef, {
            name: clientInfo.name,
            phone: clientInfo.phone,
          });
          toast.success("Profile updated successfully");
      
          
          updateProfile(user, { displayName: clientInfo.name });
          toast.success("Profile updated successfully in both Firestore and Auth");
        } else {
          await setDoc(userDocRef, {
            uid: userUid,
            name: clientInfo.name,
            phone: clientInfo.phone,
          });
          toast.success("Profile created successfully");
        }
          
        
      }
    } catch (error) {
      console.error("Error updating or creating profile:", error);
      toast.error("Error updating profile.");
    }
  };

  useEffect(() => {
    fetchClientInfo();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">User Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Login Information</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            className="border rounded-lg px-4 py-2 w-full"
            value={clientInfo.name}
            onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Phone</label>
          <input
            type="text"
            className="border rounded-lg px-4 py-2 w-full"
            value={clientInfo.phone}
            onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="border rounded-lg px-4 py-2 w-full bg-gray-100"
            value={clientInfo.email}
            readOnly
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

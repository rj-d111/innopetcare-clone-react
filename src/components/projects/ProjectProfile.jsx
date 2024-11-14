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
import { getAuth, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { toast } from "react-toastify";
import Spinner from "../../components/Spinner";

export default function ProjectProfile() {
  const [clientInfo, setClientInfo] = useState({
    name: "",
    phone: "",
    email: "",
    profileImage: "https://innopetcare.com/_services/unknown_user.jpg",
  });
  const [loading, setLoading] = useState(true);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch client info from Firestore
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

  // Handle profile image change
  const handleProfileImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      setClientInfo((prev) => ({ ...prev, profileImage: previewUrl }));
    }
  };

  // Save changes to Firestore and Firebase Auth
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const userUid = user.uid;
      const userDocRef = doc(db, "clients", userUid);

      // Update profile image if a new file was selected
      if (profileImageFile) {
        const imageRef = ref(storage, `profileImages/${userUid}`);
        await uploadBytes(imageRef, profileImageFile);
        const profileImageUrl = await getDownloadURL(imageRef);
        await updateDoc(userDocRef, { profileImage: profileImageUrl });
        setClientInfo((prev) => ({ ...prev, profileImage: profileImageUrl }));
        toast.success("Profile image updated successfully.");
      }

      // Update name and phone
      await updateDoc(userDocRef, {
        name: clientInfo.name,
        phone: clientInfo.phone,
      });

      // Update the displayName in Firebase Auth
      await updateProfile(user, {
        displayName: clientInfo.name,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile.");
    } finally {
      setSaving(false);
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
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>

        {/* Profile Image */}
        <div className="mb-4">
          <label className="block text-gray-700">Profile Picture</label>

          {/* Profile Picture Frame */}
          <div className="flex justify-start mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
              <img
                src={clientInfo.profileImage}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* File Input */}
          <div className="flex justify-start">
            <input
              type="file"
              className="file-input file-input-bordered file-input-warning w-full max-w-xs"
              onChange={handleProfileImageChange}
            />
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            className="border rounded-lg px-4 py-2 w-full"
            value={clientInfo.name}
            onChange={(e) =>
              setClientInfo({ ...clientInfo, name: e.target.value })
            }
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-gray-700">Phone</label>
          <input
            type="text"
            className="border rounded-lg px-4 py-2 w-full"
            value={clientInfo.phone}
            onChange={(e) =>
              setClientInfo({ ...clientInfo, phone: e.target.value })
            }
          />
        </div>

        {/* Email (Read-only) */}
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="border rounded-lg px-4 py-2 w-full bg-gray-100"
            value={clientInfo.email}
            readOnly
          />
        </div>

        {/* Save Button */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={handleSaveChanges}
          disabled={saving}
        >
          {saving ? <Spinner /> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

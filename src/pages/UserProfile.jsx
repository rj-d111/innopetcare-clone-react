import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import {
  getAuth,
  reauthenticateWithCredential,
  applyActionCode,
  checkActionCode,
  EmailAuthProvider,
  updateProfile,
} from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export default function UserProfile() {
  const [clientInfo, setClientInfo] = useState({
    name: "",
    phone: "",
    email: "",
    profileImage: "https://innopetcare.com/_services/unknown_user.jpg",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hideEmailFields, setHideEmailFields] = useState(false);
  const [password, setPassword] = useState("");
  const auth = getAuth();
  const user = auth.currentUser;
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get("mode");
    const oobCode = queryParams.get("oobCode");

    if (mode === "signIn") {
      setHideEmailFields(true);
      setShowPasswordModal(true);
    } else if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          toast.success("Email verified successfully!");
          setIsEmailVerified(true);
          fetchClientInfo();
        })
        .catch((error) => {
          console.error("Error verifying email:", error);
          toast.error("Failed to verify email.");
        });
    }
  }, [location, auth]);

  const fetchClientInfo = async () => {
    try {
      const clientDoc = await getDoc(doc(db, "users", user.uid));
      if (clientDoc.exists()) {
        setClientInfo(clientDoc.data());
      }
    } catch (error) {
      console.error("Error fetching client info:", error);
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^9\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImageFile(e.target.files[0]);
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      setClientInfo((prev) => ({ ...prev, profileImage: previewUrl }));
    }
  };

  const handleSaveChanges = async () => {
    if (!validatePhoneNumber(clientInfo.phone)) {
      toast.error("Phone number must be in the format 9XXXXXXXXX.");
      return;
    }
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    setSaving(true);
    setShowPasswordModal(false);
  
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      const userUid = auth.currentUser.uid;
      const userDocRef = doc(db, "users", userUid);
  
      // Update profile image if a new file was selected
      if (profileImageFile) {
        const imageRef = ref(storage, `profileImages/${userUid}`);
        await uploadBytes(imageRef, profileImageFile);
        const profileImageUrl = await getDownloadURL(imageRef);
        await updateDoc(userDocRef, { profileImage: profileImageUrl });
        setClientInfo((prev) => ({ ...prev, profileImage: profileImageUrl }));
        toast.success("Profile image updated successfully.");
      }
  
      // Update name and phone in Firestore
      await updateDoc(userDocRef, {
        name: clientInfo.name,
        phone: clientInfo.phone,
      });
  
      // Update the displayName of the current user in Firebase Authentication
      await updateProfile(auth.currentUser, {
        displayName: clientInfo.name,
      });
  
      toast.success("Profile updated successfully");
      navigate("/profile"); // Redirect to the profile page
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile.");
    } finally {
      setSaving(false);
      setPassword("");
    }
  };

  const closeModal = () => {
    setShowPasswordModal(false);
    setPassword("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    fetchClientInfo();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">User Profile</h1>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">Login Information</h2>

          <div className="mb-4">
            <label className="block text-gray-700">Profile Picture</label>
            <div className="avatar">
              <div className="w-24 rounded-full">
                <img src={clientInfo.profileImage} alt="Profile" />
              </div>
            </div>
          </div>
          <input
            type="file"
            className="file-input file-input-bordered file-input-warning w-full max-w-xs"
            onChange={handleProfileImageChange}
          />

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
            disabled={saving}
          >
            {saving ? <Spinner /> : "Save Changes"}
          </button>
        </div>

      </div>
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center fade transition-opacity duration-300 z-40"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg md:w-[50%] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Enter Your Password Before Saving Changes
            </h2>
            
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                className="border rounded-lg px-4 py-2 w-full pr-10" // Add padding for the icon space
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
              onClick={handlePasswordSubmit}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
}

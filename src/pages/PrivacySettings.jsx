import React, { useState } from "react";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  signOut,
} from "firebase/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { db } from "../firebase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";

export default function PrivacySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [password, setPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handlePasswordChange = async () => {
    if (newPassword !== retypePassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await reauthenticate(); // Re-authenticate the user before updating the password
      await updatePassword(user, newPassword);
      toast.success("Password changed successfully");
    } catch (error) {
      toast.error("Error updating password");
      console.error("Error updating password:", error);
    }
  };

  const reauthenticate = async () => {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
      toast.success("Re-authentication successful");
    } catch (error) {
      console.error("Error during re-authentication:", error);
      alert("Re-authentication failed. Please make sure you entered the correct current password.");
      throw error;
    }
  };

  const handleReauthenticateAndDelete = async () => {
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
  
      // Update user's status to "deleted" in Firestore instead of deleting the document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { status: "archived" });
  
      // Delete the user from Firebase Authentication
      await deleteUser(user);
      toast.success("Account deleted successfully");
  
      // Sign out and navigate to the login page
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else {
        toast.error("Error deleting account. Please try again.");
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Privacy Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Current Password</label>
          <input
            type="password"
            className="border rounded-lg px-4 py-2 w-full"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            className="border rounded-lg px-4 py-2 w-full"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Retype New Password</label>
          <input
            type="password"
            className="border rounded-lg px-4 py-2 w-full"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={handlePasswordChange}
        >
          Save Password
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Delete Account</h2>
        <p className="text-gray-600 mb-4">
          Deleting your account is a permanent action. Once your account is deleted, it cannot be recovered.
        </p>
        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition duration-200 ease-in-out"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Account Deletion</h3>
            <p className="text-gray-600 mb-4">
              Please enter your password to confirm account deletion. This action is permanent.
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                onClick={handleReauthenticateAndDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

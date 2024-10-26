import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore'; // Firestore functions
import { db } from '../firebase'; // Firebase initialization
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'; // Firebase Auth functions
import { toast } from 'react-toastify';
import Spinner from "../components/Spinner" // Assuming Spinner is in the same directory

export default function UserProfile() {
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const auth = getAuth();

  const fetchClientInfo = async () => {
    try {
      const user = auth.currentUser; // Get the current user
  
      // Attempt to get the document directly using the user's uid
      const clientDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (clientDoc.exists()) {
        // If the document exists, set the client info from the document data
        setClientInfo(clientDoc.data());
      } else {
        // If the document does not exist, proceed to query the users collection
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", user.uid) // Query users by user.uid
        );
  
        const querySnapshot = await getDocs(userQuery);
        if (!querySnapshot.empty) {
          // If any documents are found, set the client info from the first document
          const userDataFromQuery = querySnapshot.docs[0].data();
          setClientInfo(userDataFromQuery);
        } else {
          console.log("No user document found for the given UID in query.");
          // Optionally set clientInfo to null or some default value
          setClientInfo(null);
        }
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
    } finally {
      setLoading(false); // Stop loading when the data is fetched
    }
  };
  

  useEffect(() => {
    fetchClientInfo();
  }, []);

  // Re-authenticate the user before performing sensitive actions like changing password
  const reauthenticate = async () => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword); // Current email and password

    try {
      await reauthenticateWithCredential(user, credential); // Re-authenticate
      toast.success('Re-authentication successful');
    } catch (error) {
      console.error('Error during re-authentication:', error);
      alert('Re-authentication failed. Please make sure you entered the correct current password.');
      throw error;
    }
  };

  const handleSaveChanges = async () => {
    try {
      const auth = getAuth();
      const userUid = auth.currentUser.uid;
      const userDocRef = doc(db, "users", userUid);
  
      // Check if a document with the current user's UID exists
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        // If the document exists, update it
        await updateDoc(userDocRef, {
          name: clientInfo.name,
          phone: clientInfo.phone,
        });
        toast.success("Profile updated successfully");
      } else {
        // If the document doesn't exist, query by the 'uid' field
        const userQuery = query(
          collection(db, "users"),
          where("uid", "==", userUid)
        );
        const querySnapshot = await getDocs(userQuery);
  
        if (!querySnapshot.empty) {
          // If a document is found, update the first matching document
          const existingDocRef = querySnapshot.docs[0].ref;
          await updateDoc(existingDocRef, {
            name: clientInfo.name,
            phone: clientInfo.phone,
          });
          toast.success("Profile updated successfully");
        } else {
          // If no document is found, create a new one with the UID as the document ID
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
  
  

  const handlePasswordChange = async () => {
    if (newPassword !== retypePassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await reauthenticate(); // Re-authenticate the user before updating the password
      const user = auth.currentUser;
      await updatePassword(user, newPassword); // Update password
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error('Error updating password');
      console.error('Error updating password:', error);
    }
  };

  // If loading, display the Spinner component
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">User Profile</h1>
      
      {/* User Information Section */}
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

      {/* Password Change Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
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
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore functions
import { db } from '../../firebase'; // Firebase initialization
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'; // Firebase Auth functions
import { toast } from 'react-toastify';
import Spinner from '../Spinner'; // Assuming Spinner is in the same directory

export default function ProjectProfile() {
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', email: '' });
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const auth = getAuth();

  const fetchClientInfo = async () => {
    try {
      const user = auth.currentUser;
      const clientDoc = await getDoc(doc(db, 'clients', user.uid));
      if (clientDoc.exists()) {
        setClientInfo(clientDoc.data());
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
      const userDoc = doc(db, 'clients', auth.currentUser.uid);
      await updateDoc(userDoc, {
        name: clientInfo.name,
        phone: clientInfo.phone,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
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

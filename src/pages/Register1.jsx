import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { db } from '../firebase'; // Ensure this is the correct path to your Firebase configuration
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  reauthenticateWithCredential
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Spinner from "../components/Spinner"

function Register1({ formData, onChange, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading spinner

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };

  const validateFields = async () => {
    setLoading(true); // Start loading spinner
    const { typeOfAdmin, name, email, phone, password, confirm_password } = formData;
  
    try {
      // Check for required fields
      if (!typeOfAdmin) {
        toast.error("Please select the type of admin.");
        return;
      }
      if (!name) {
        toast.error("Name is required.");
        return;
      }
      if (!email) {
        toast.error("Email is required.");
        return;
      }
      if (!phone) {
        toast.error("Phone number is required.");
        return;
      }
      if (!password) {
        toast.error("Password is required.");
        return;
      }
      if (!confirm_password) {
        toast.error("Please confirm your password.");
        return;
      }
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email.");
        return;
      }
  
      // Check if email already exists in Firestore across collections
      const collections = ["tech-admin", "clients", "users"];
      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, where("email", "==", email));
  
        try {
          const querySnapshot = await getDocs(q);
          const validDocs = querySnapshot.docs.filter(doc => doc.data().status !== "deleted");
          if (validDocs.length > 0) {
            toast.error("This email is already in use. Please try another one.");
            return;
          }
        } catch (error) {
          console.error("Error checking email in Firestore", error);
          toast.error("An error occurred while checking the email.");
          return;
        }
      }
  
      // Validate phone format (9XXXXXXXXX)
      const phoneRegex = /^9\d{9}$/;
      if (!phoneRegex.test(phone)) {
        toast.error("Phone number must be in the format 9XXXXXXXXX.");
        return;
      }
  
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

      if (!passwordRegex.test(password)) {
        toast.error("Password must be at least 8 characters long and contain both letters and numbers.");
        return;
      }
      
      // Validate password confirmation
      if (password !== confirm_password) {
        toast.error("Passwords do not match.");
        return;
      }
  
      // If all validations pass
      toast.success("Step 1 completed successfully!");
      onNext();
    } finally {
      setLoading(false); // Ensure loading is stopped after validation
    }
  };
  

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); validateFields(); }}>
        <label className="block mb-2 text-gray-700">Type of Admin</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) => handleInputChange('typeOfAdmin', e.target.value)}
          value={formData.typeOfAdmin || ""}
        >
          <option value="">Select Admin Type</option>
          <option value="Veterinary Admin">Veterinary Admin</option>
          <option value="Animal Shelter Admin">Animal Shelter Admin</option>
        </select>

        <div className="mb-5">
          <label htmlFor="name" className="block text-gray-500 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name || ""}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block text-gray-500 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email || ""}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="phone" className="block text-gray-500 mb-2">
            Phone No. (Format: 9XXXXXXXXX)
          </label>
          <div className="flex">
            <div className="w-1/6 bg-gray-200 text-center py-2 rounded-l-lg border border-gray-300">
              +63
            </div>
            <input
              type="tel"
              id="phone"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your Phone No."
              className="w-5/6 px-4 py-2 rounded-r-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block text-gray-500 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password || ""}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            {showPassword ? (
              <FaEyeSlash
                className="absolute right-3 top-3 text-xl cursor-pointer"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            ) : (
              <FaEye
                className="absolute right-3 top-3 text-xl cursor-pointer"
                onClick={() => setShowPassword((prevState) => !prevState)}
              />
            )}
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="confirm_password" className="block text-gray-500 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm_password"
            value={formData.confirm_password || ""}
            onChange={(e) => handleInputChange('confirm_password', e.target.value)}
            placeholder="Confirm your password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <button
  type="submit"
  className={`w-full uppercase text-white px-4 py-2 rounded-lg flex items-center justify-center ${
    loading ? "bg-gray-400" : "bg-yellow-600"
  }`}
  disabled={loading} // Correct way to conditionally disable the button
>
  {loading ? (
    <>
      <Spinner /> {/* Assuming Spinner is an icon or loading component */}
      <span>Please wait...</span>
    </>
  ) : (
    "Next"
  )}
</button>

      </form>
    </>
  );
}

export default Register1;

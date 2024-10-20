import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { db } from "../firebase"; // Import your Firebase configuration
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Modular import for Firebase Auth
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Firestore functions

export default function Register1({ setError, nextStep }) {
  const auth = getAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { name, phone, email, password, confirm_password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
    setError(""); // Clear error on change
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name || !email || !password || !confirm_password || !phone) {
      setError("Please fill all the required fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Need to provide a valid email");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setFormData((prevState) => ({
        ...prevState,
        password: "",
        confirm_password: "",
      }));
      return;
    }

    if (password !== confirm_password) {
      setError("The password does not match with confirm password");
      setFormData((prevState) => ({
        ...prevState,
        password: "",
        confirm_password: "",
      }));
      return;
    }

    if (!/^9\d{9}$/.test(phone)) {
      setError(
        "The phone number must start with 9 and be followed by 9 digits."
      );
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload additional user data to Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid, // Store the user's UID
        name,
        email,
        phone,
        isVerified: false, // Set isVerified to false initially
        timestamp: serverTimestamp(), // Use Firestore's serverTimestamp for the current date/time
      });

      // Trigger success toast
      toast.success("Successfully Registered!");

      // Move to the next step
      nextStep();
    } catch (error) {
      setError("Error submitting the form: " + error.message);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label className="block mb-2 text-gray-700">Type of Admin</label>
        <select className="w-full p-2 border border-gray-300 rounded-md mb-4">
          <option>Veterinary Admin</option>
          <option>Animal Shelter Admin</option>
        </select>

        <div className="mb-5">
          <label htmlFor="name" className="block text-gray-500 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={onChange}
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
            value={email}
            onChange={onChange}
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
              value={phone}
              onChange={onChange}
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
              value={password}
              onChange={onChange}
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
            value={confirm_password}
            onChange={onChange}
            placeholder="Confirm your password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full uppercase bg-yellow-600 text-white px-4 py-2 rounded-lg"
        >
          Next
        </button>
      </form>
      <ToastContainer />
    </>
  );
}

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Register1({ setError, nextStep, formData, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  const { name, phone, email, password, confirm_password } = formData;

  const onSubmit = (e) => {
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
      return;
    }

    if (password !== confirm_password) {
      setError("The password does not match with confirm password");
      return;
    }

    if (!/^9\d{9}$/.test(phone)) {
      setError("The phone number must start with 9 and be followed by 9 digits.");
      return;
    }

    // Move to the next step, formData is passed to the next component
    nextStep();
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label className="block mb-2 text-gray-700">Type of Admin</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) => onChange({ typeOfAdmin: e.target.value })}
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
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
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
            onChange={(e) => onChange({ email: e.target.value })}
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
              onChange={(e) => onChange({ phone: e.target.value })}
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
              onChange={(e) => onChange({ password: e.target.value })}
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
            onChange={(e) => onChange({ confirm_password: e.target.value })}
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

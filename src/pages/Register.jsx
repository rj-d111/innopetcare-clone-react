import React from "react";
import { useState } from "react";
import OAuth from "../components/OAuth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { name, phone, email, password, confirm_password } = formData;
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="container flex flex-col md:flex-row items-center justify-center my-10 mx-3">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/3 w-full">
          <div className="text-center mb-6">
            <img
              src="/images/innopetcare-black.png"
              alt="InnoPetCare Logo"
              className="mx-auto mb-4"
            />
            <h2 class="font-bold text-yellow-900 flex flex-col sm:flex-row items-center justify-center">
              Welcome!
              <span class="sm:ml-1">Login to your account.</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Already Registered?{" "}
              <span
                className="text-sm text-yellow-600 hover:underline hover:text-yellow-800 transition duration-200 ease-in-out"
              >
                <Link to="/login">
                Login
                </Link>
              </span>
            </p>
          </div>

          <form action="LoginController" method="POST">
            <div className="mb-5">
              <label htmlFor="name" className="block text-gray-500 mb-2">
                Name
              </label>
              <input
                type="name"
                id="name"
                name="name"
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
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div class="mb-5">
              <label for="contact" class="block text-gray-500 mb-2">
                Phone No. (Format: +639XXXXXXXXX)
              </label>
              <div class="flex">
                <div class="w-1/6 bg-gray-200 text-center py-2 px-3 rounded-l-lg border border-gray-300">
                  +63
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={onChange}
                  placeholder="Enter your Phone No."
                  class="w-5/6 px-4 py-2 rounded-r-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  pattern="9[0-9]{9}"
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block text-gray-500 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
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
              <label htmlFor="password" className="block text-gray-500 mb-2">
                Confirm Password
              </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={confirm_password}
                  onChange={onChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            <button
              type="submit"
              className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg active:shadow-lg transition duration-200 ease-in-out"
            >
              Sign Up
            </button>
          </form>
          <div
            className="my-4 items-center 
            before:border-t flex before:flex-1
            after:border-t after:flex-1
            "
          >
            <p className="text-center text-sm font-semibold text-gray-600 mx-4">
              OR
            </p>
          </div>
          <OAuth />
        </div>
      </div>
    </section>
  );
}

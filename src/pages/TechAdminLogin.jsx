import React, { useState } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {toast} from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import {db} from "../firebase";
import platformImage from "../assets/png/platform.png";

export default function TechAdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const navigate = useNavigate();
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
  async function onSubmit(e){
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await 
      signInWithEmailAndPassword(auth, email, password)
      if (userCredential.user) {
        const user = userCredential.user;
  
        // Navigate to another page if successful
        navigate("/");
  
        // Fetch the user document from Firestore using the user's uid
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // Access the name field from the fetched document
          const userName = userData.name;
  
          // Display the user's name in a success toast
          toast.success(`Welcome, ${userName}`);
        } else {
          console.log("No such document!");
        }
      }
    } catch (error) {
      toast.error("Invalid user credentials");
    }
  }
  return (
    <div className="bg-gray-100">
      <section className="min-h-screen flex items-center justify-center mx-3">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center my-10">
          {/* Left side with laptop and phone image */}
          <div className="hidden md:block md:w-3/4 lg:w-1/2">
            <div className="p-10">
              <img
                src={platformImage}
                alt="Laptop and phone with InnoPetCare"
                className="max-w-full h-auto select-none"
              />
            </div>
          </div>
          {/* Right side login form */}
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/3 w-full">
            <div className="text-center mb-6">
              <img
                src="/images/innopetcare-black.png"
                alt="InnoPetCare Logo"
                className="mx-auto mb-4 select-none"
              />
              <p className="text-gray-600 text-sm">
                InnoPetCare is a content management system (CMS) designed
                specifically for veterinary clinics and animal shelters to
                manage their online presence.
              </p>
            </div>
            <h2 class="font-bold text-yellow-900 text-center">
              Welcome! Login to your account as a tech admin
            </h2>
            <p className="text-gray-600 text-sm mb-6 text-center mt-1">
              Let's work together to care for our furry friends.
            </p>
            <form onSubmit={onSubmit}>
              <div className="mb-5">
                <label htmlFor="email" className="block text-gray-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
                  value={email}
                  onChange={onChange}
                />
              </div>
              <div className="mb-5">
                <label htmlFor="password" className="block text-gray-500 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
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
              <button
                type="submit"
                className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
              >
                Log In
              </button>
            </form>
            <div className="text-center mt-6">
              <p className="text-sm text-yellow-600 hover:underline hover:text-yellow-800 transition duration-200 ease-in-out">
                <Link to="/forgot-password">Forgot password?</Link>
              </p>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?
                <Link
                  to="/admin/register"
                  className="ms-1 text-yellow-600 font-semibold hover:underline hover:text-yellow-800 transition duration-200 ease-in-out"
                >
                  Register
                </Link>
              </p>
            </div>
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
    </div>
  );
}

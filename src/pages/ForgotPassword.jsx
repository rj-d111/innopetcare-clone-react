import React, { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import OAuth from "../components/OAuth";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  function onChange(e) {
      setEmail(e.target.value);
    };
  
  const navigate = useNavigate();
  async function onSubmit(e){
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success("Email was sent");
      navigate("/login");
    } catch (error) {
      toast.error("Could not send reset password");
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
                src="images/platform.png"
                alt="Laptop and phone with InnoPetCare"
                className="max-w-full h-auto select-none"
              />
            </div>
          </div>
          {/* Right side forgot password form */}
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
            <h2 class="font-bold text-yellow-900 flex flex-col sm:flex-row items-center justify-center">
              Forgot Your Password?
            </h2>
            <p className="text-gray-600 text-sm mb-6 text-center mt-1">
              Enter yout email and we'll send you a link to reset your password
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

              <button
                type="submit"
                className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
              >
                Send Reset Password
              </button>
            </form>
            <div class="mt-6">
              <Link to="/login">
                <p class="text-sm text-yellow-600 hover:underline hover:text-yellow-800 transition duration-200 ease-in-out flex items-center justify-center">
                  <FaChevronLeft class="mr-2" />
                  Back to Login
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

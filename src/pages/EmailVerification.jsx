import React, { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import { MdEmail } from "react-icons/md";

export default function EmailVerification() {
  const [email, setEmail] = useState("");

  function onChange(e) {
    setEmail(e.target.value);
  }

  const navigate = useNavigate();
  async function onSubmit(e) {
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
    <div className=" flex items-center justify-center my-10 mx-3 text-center">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/2 w-full">
        <div className="flex justify-center">
          <div className="bg-yellow-300 rounded-full p-5 flex items-center justify-center">
            <MdEmail className="text-6xl text-yellow-900" />
          </div>
        </div>
        <h1 className="font-bold text-yellow-900 text-3xl mb-4">
          Verify your Email Address
        </h1>
        <p className="text-gray-600">You're almost there! We've sent you an email to</p>
        <p className="font-bold">emeeme@gmail.com</p>
        <p className="text-gray-600 my-4">
          Just click on the link in that email to complete your signup. If you
          don't see it, you may need to{" "}
          <span className="font-bold text-black">check your spam</span> folder
        </p>
        <p className="mt-4 text-gray-600">Can't find the email? No problem</p>
        <button
          type="submit"
          className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg mt-6"
        >
          Resend Verification Email
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../../firebase";
import { doc, serverTimestamp, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

export default function ProjectRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const { name, phone, email, password, confirm_password } = formData;
  const navigate = useNavigate();
  const [slug, setSlug] = useState(""); // Replace with actual logic to get the slug

  // Function to extract the slug from the URL
  useEffect(() => {
    const pathname = window.location.href;
    const parts = pathname.split("sites/");
    if (parts.length > 1) {
      const extractedSlug = parts[1].split("/")[0]; // Get only the first part after "/"
      setSlug(extractedSlug); // Set the slug state
    }
  }, []); // Runs once when component mounts

  // Redirect to specific register page based on user role
  const handleLoginClick = () => {
    navigate(`/sites/${slug}/appointments/`);
  };

  useEffect(() => {
    if (error) {
      setShowError(true);
      setCountdown(5);

      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownTimer);
            setShowError(false);
            setError(""); // Clear error after fading out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [error]);

  const closeError = () => {
    setShowError(false);
    setError(""); // Clear error when closed
  };

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
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(auth.currentUser, {
        displayName: name,
      });
      const user = userCredential.user;

      // Fetch the projectId based on the slug from global-sections
      const q = query(collection(db, "global-sections"), where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      let projectId = null;
      if (!querySnapshot.empty) {
        projectId = querySnapshot.docs[0].data().projectId; // Get the projectId
      } else {
        throw new Error("No project found for the given slug.");
      }

      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      delete formDataCopy.confirm_password;
      formDataCopy.phone = "+63" + formDataCopy.phone;
      formDataCopy.timestamp = serverTimestamp();
      formDataCopy.isApproved = false; // Set isApproved to false
      formDataCopy.projectId = projectId; // Add projectId

      await setDoc(doc(db, "clients", user.uid), formDataCopy);
      
      // Redirect to the appropriate page based on isApproved
      if (!formDataCopy.isApproved) {
        navigate(`/sites/${slug}/approval`);
      } else {
        navigate(`/sites/${slug}/appointments`);
      }

      toast.success("Success! Your account has been created!");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email address already in use. Please sign in instead.");
        toast.error("Email address already in use. Please sign in instead.");
      } else {
        setError(error.message || "An unexpected error occurred.");
      }
    }
  };

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
            <h2 className="font-bold text-yellow-900 flex flex-col sm:flex-row items-center justify-center">
              Welcome!
              <span className="sm:ml-1">Register your account.</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Already Registered?{" "}
              <span className="text-sm text-yellow-600 hover:underline hover:text-yellow-800 transition duration-200 ease-in-out">
                <span onClick={handleLoginClick} className="cursor-pointer"
                >Login</span>
              </span>
            </p>
          </div>

          {showError && (
            <div className="flex justify-between items-center bg-red-500 text-white p-4 rounded-lg mb-4 transition-opacity duration-500">
              <span>
                {error} (Will be closed in {countdown} seconds)
              </span>
              <button onClick={closeError} className="text-white font-bold">
                &times;
              </button>
            </div>
          )}

          <form onSubmit={onSubmit}>
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
              <label
                htmlFor="confirm_password"
                className="block text-gray-500 mb-2"
              >
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
              className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg active:shadow-lg transition duration-200 ease-in-out"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

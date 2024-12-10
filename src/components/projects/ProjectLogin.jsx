import React, { useState, useEffect } from "react";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import { doc, getDoc, query, where, collection, getDocs, updateDoc, serverTimestamp } from "firebase/firestore";
import platformImage from "../../assets/png/platform.png";
import { db } from "../../firebase";
import ProjectOAuth from "./ProjectOAuth";
import Spinner from "../../components/Spinner"; // Import Spinner
import ProjectFooter from "./ProjectFooter";

export default function ProjectLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { email, password } = formData;
  const navigate = useNavigate();
  const { slug} = useParams();
  const [loading, setLoading] = useState(false); // Add loading state

  // Handle input change
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
  
  
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      if (userCredential.user) {
        const user = userCredential.user;
  
        // Fetch the user document from Firestore using the user's uid
        const docRef = doc(db, "clients", user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const userName = userData.name;
  
          // Fetch the slugId from the global-sections collection
          const globalSectionsRef = collection(db, "global-sections");
          const slugQuery = query(globalSectionsRef, where("slug", "==", slug));
          const slugSnapshot = await getDocs(slugQuery);
  
          if (!slugSnapshot.empty) {
            const slugDoc = slugSnapshot.docs[0];
            const slugId = slugDoc.id; // Get the document ID of the slug
  
            // Check if the user's projectId matches the slugId
            if (userData.projectId === slugId) {
              // Update the lastActivityTime to the current timestamp
              await updateDoc(docRef, { lastActivityTime: serverTimestamp() });
  
              // Display the user's name in a success toast
              toast.success(`Welcome, ${userName}`);
  
              // Check isApproved field and navigate accordingly
              if (userData.status === "approved") {
                navigate(`/sites/${slug}/dashboard`);
              } else if(userData.status !=="approved" && !user.emailVerified){
                navigate(`/sites/${slug}/email-verification`);
              }
                else {
                navigate(`/sites/${slug}/approval`);
              }
            } else {
              // Show error if projectId does not match slugId
              toast.error(`User cannot be found for this site`);
              await auth.signOut(); // Sign out the user if there's a mismatch
            }
          } else {
            toast.error("Invalid site. Please check the URL.");
          }
        } else {
          console.log("No such document!");
        }
      }
    } catch (error) {
      toast.error("Invalid user credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bg-gray-100">
        <section className="min-h-screen flex items-center justify-center mx-3">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-center my-10">
            <div className="hidden md:block md:w-3/4 lg:w-1/2">
              <div className="p-10">
                <img
                  src={platformImage}
                  alt="Laptop and phone with InnoPetCare"
                  className="max-w-full h-auto select-none"
                />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/3 w-full">
              {loading ? (
                <Spinner /> // Show Spinner while loading
              ) : (
                <>
                  <div className="text-center mb-6">
                    <img
                      src="/images/innopetcare-black.png"
                      alt="InnoPetCare Logo"
                      className="mx-auto mb-4 select-none"
                    />
                    <p className="text-gray-600 text-sm">
                      InnoPetCare is a content management system (CMS) designed specifically for veterinary clinics and animal shelters to manage their online presence.
                    </p>
                  </div>
                  <h2 className="font-bold text-yellow-900 flex flex-col sm:flex-row items-center justify-center">
                    Welcome! Login to your account.
                  </h2>
                  <p className="text-gray-600 text-sm mb-6 text-center mt-1">
                    Let's work together to care for our furry friends.
                  </p>
                  <form onSubmit={onSubmit}>
                    <div className="mb-5">
                      <label htmlFor="email" className="block text-gray-500 mb-2">Email</label>
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
                      <label htmlFor="password" className="block text-gray-500 mb-2">Password</label>
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
                      <Link to={`/sites/${slug}/forgot-password`}
                      >Forgot password?</Link>
                    </p>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Don't have an account?
                      <Link
                  to={`/sites/${slug}/register`}
                  className="ms-1 text-yellow-600 font-semibold hover:underline hover:text-yellow-800 transition duration-200 ease-in-out"
                      >
                        Register
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
      <ProjectFooter />
    </>
  );
}

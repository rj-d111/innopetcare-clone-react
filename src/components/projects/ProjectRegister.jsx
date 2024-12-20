import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db } from "../../firebase";
import {
  doc,
  serverTimestamp,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import ProjectFooter from "./ProjectFooter";
import Spinner from "../Spinner";

export default function ProjectRegister() {
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
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
  const { slug } = useParams();
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, phone, email, password, confirm_password } = formData;
  const navigate = useNavigate();

  // Redirect to specific register page based on user role
  const handleLoginClick = () => {
    navigate(`/sites/${slug}/dashboard/`);
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

    // Set loading to true when form submission begins
    setLoading(true);

    // Validation
    if (!name || !email || !password || !confirm_password || !phone) {
      toast.error("Please fill all the required fields");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please provide a valid email");
      setLoading(false);
      return;
    }

    const failedRule = passwordRules.find(
      (rule) => !rule.test(password)
    );
    if (failedRule) {
      toast.error(`Password does not meet the requirement: ${failedRule.rule}`);
      setLoading(false);
      return;
    }

    if (password !== confirm_password) {
      toast.error("The password and confirm password do not match");
      setFormData((prevState) => ({
        ...prevState,
        password: "",
        confirm_password: "",
      }));
      setLoading(false);
      return;
    }

    if (!/^9\d{9}$/.test(phone)) {
      toast.error(
        "The phone number must start with 9 and be followed by 9 digits."
      );
      setLoading(false);
      return;
    }

    try {
      // Check if email already exists in any of the collections
      const checkEmailDuplicate = async (email) => {
        const clientsQuery = query(
          collection(db, "clients"),
          where("email", "==", email)
        );
        const usersQuery = query(
          collection(db, "users"),
          where("email", "==", email)
        );
        const techAdminQuery = query(
          collection(db, "tech-admin"),
          where("email", "==", email)
        );

        const [clientsSnapshot, usersSnapshot, techAdminSnapshot] =
          await Promise.all([
            getDocs(clientsQuery),
            getDocs(usersQuery),
            getDocs(techAdminQuery),
          ]);

        if (
          !clientsSnapshot.empty ||
          !usersSnapshot.empty ||
          !techAdminSnapshot.empty
        ) {
          return true; // Email is already used
        }
        return false; // Email is not used
      };

      const emailExists = await checkEmailDuplicate(email);

      if (emailExists) {
        toast.error(
          "This email is already in use. Please use a different email."
        );
        setLoading(false);
        return;
      }

      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(auth.currentUser, { displayName: name });

      const user = userCredential.user;

      const q = query(
        collection(db, "global-sections"),
        where("slug", "==", slug)
      );
      const querySnapshot = await getDocs(q);

      let projectId = null;
      if (!querySnapshot.empty) {
        // Get the projectId from the document ID itself
        projectId = querySnapshot.docs[0].id;
      } else {
        throw new Error("No project found for the given slug.");
      }

      const projectRef = doc(db, "projects", projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        throw new Error("No project found with the given projectId.");
      }

      const projectData = projectDoc.data();
      const isAnimalShelterSite = projectData.type === "Animal Shelter Site";

      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      delete formDataCopy.confirm_password;
      formDataCopy.accountCreated = serverTimestamp();
      formDataCopy.status = isAnimalShelterSite ? "approved" : "pending";
      formDataCopy.projectId = projectId;
      formDataCopy.profileImage = "";

      await setDoc(doc(db, "clients", user.uid), formDataCopy);

      // if (formDataCopy.status === "pending") {
      //   navigate(`/sites/${slug}/approval`);
      // } else {
      //   navigate(`/sites/${slug}/dashboard`);
      // }

      navigate(`/sites/${slug}/email-verification`);

      toast.info("Verification email has been sent.");
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      // Set loading to false after form submission completes
      setLoading(false);
    }
  };

  const passwordRules = [
    {
      rule: "At least 8 characters in length",
      test: (password) => password.length >= 8,
    },
    {
      rule: "At least one uppercase letter",
      test: (password) => /[A-Z]/.test(password),
    },
    {
      rule: "At least one lowercase letter",
      test: (password) => /[a-z]/.test(password),
    },
    {
      rule: "At least one number",
      test: (password) => /[0-9]/.test(password),
    },
    {
      rule: "At least one special character (e.g., !, @, #)",
      test: (password) => /[!@#$%^&*]/.test(password),
    },
  ];

  return (
    <>
      <section className="bg-gray-100 min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="container flex flex-col md:flex-row items-center justify-center my-10 mx-3">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/3 w-full">
            <div className="text-center mb-6">
              <img
                src="/images/innopetcare-black.png"
                alt="InnoPetCare Logo"
                className="mx-auto mb-4"
              />
              <h2 className="font-bold text-yellow-900 flex flex-col sm:flex-row items-center justify-center">
                Welcome! Register your account.
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Already Registered?{" "}
                <span className="text-sm text-yellow-600 hover:underline hover:text-yellow-800 transition duration-200 ease-in-out">
                  <span onClick={handleLoginClick} className="cursor-pointer">
                    Login
                  </span>
                </span>
              </p>
            </div>
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
                    maxLength={10}
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
              onFocus={() => setIsPasswordTouched(true)} // Set touched state on focus
              onBlur={() => setIsPasswordTouched(false)} // Reset touched state on blur
              onChange={onChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 ${
                !isPasswordTouched && !formData.password ? "focus:ring-gray-300 border-gray-300" 
                :
                formData.password &&
                !passwordRules.find((rule) => !rule.test(formData.password))
                  ? "focus:ring-green-500 border-green-500"
                  : "focus:ring-red-500 border-red-500"
              }`}
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
          {isPasswordTouched && (
            <div className="mt-2 p-3 border border-gray-400 md-rounded bg-slate-900 text-white">
              <h3 className="font-bold mb-2">Password Assistance</h3>
              <ul className="space-y-1">
                {passwordRules.map((rule, index) => (
                  <li
                    key={index}
                    className={`flex items-center ${
                      rule.test(formData.password || "")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {rule.test(formData.password || "") ? "✔" : "✘"} {rule.rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

              <div className="mb-5">
                <label
                  htmlFor="confirm_password"
                  className="block text-gray-500 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    value={confirm_password}
                    onChange={onChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  {showConfirmPassword ? (
                    <FaEyeSlash
                      className="absolute right-3 top-3 text-xl cursor-pointer"
                      onClick={() =>
                        setShowConfirmPassword((prevState) => !prevState)
                      }
                    />
                  ) : (
                    <FaEye
                      className="absolute right-3 top-3 text-xl cursor-pointer"
                      onClick={() =>
                        setShowConfirmPassword((prevState) => !prevState)
                      }
                    />
                  )}
                </div>
              </div>

              <div className="form-control"></div>
              <section className="flex flex-col gap-2 mb-4">
                <label className="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" required className="checkbox" />
                  <span className="label-text">
                    I agree to the
                    <a
                      href={`/sites/${slug}/terms-and-conditions/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 link link-info hover:text-warning transition duration-200 ease-in-out"
                    >
                      Terms and Conditions
                    </a>
                  </span>
                </label>
                <label className="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" required className="checkbox" />
                  <span className="label-text">
                    I agree to the
                    <a
                      href={`/sites/${slug}/privacy-policy/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 link link-info hover:text-warning transition duration-200 ease-in-out"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </section>

              <button
                type="submit"
                className={`w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg active:shadow-lg transition duration-200 ease-in-out ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Please wait...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
      <ProjectFooter />
    </>
  );
}

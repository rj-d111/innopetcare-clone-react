import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { db } from "../firebase"; // Ensure this is the correct path to your Firebase configuration
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  reauthenticateWithCredential,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import Spinner from "../components/Spinner";

function Register1({ formData, onChange, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };

  const validateFields = async () => {
    setLoading(true); // Start loading spinner
    const { typeOfAdmin, name, email, phone, password, confirm_password } =
      formData;

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
          const validDocs = querySnapshot.docs.filter(
            (doc) => doc.data().status !== "deleted"
          );
          if (validDocs.length > 0) {
            toast.error(
              "This email is already in use. Please try another one."
            );
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
      
         // Validate password against all passwordRules
    const failedRule = passwordRules.find(
      (rule) => !rule.test(password)
    );
    if (failedRule) {
      toast.error(`Password does not meet the requirement: ${failedRule.rule}`);
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          validateFields();
        }}
      >
        <label className="block mb-2 text-gray-700">Type of Admin</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          onChange={(e) => handleInputChange("typeOfAdmin", e.target.value)}
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
            onChange={(e) => handleInputChange("name", e.target.value)}
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
            onChange={(e) => handleInputChange("email", e.target.value)}
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
              maxLength={10}
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
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
              onChange={(e) => handleInputChange("password", e.target.value)}
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
              value={formData.confirm_password || ""}
              onChange={(e) =>
                handleInputChange("confirm_password", e.target.value)
              }
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

        <button
          type="submit"
          className={`w-full uppercase text-white px-4 py-2 rounded-lg flex items-center justify-center ${
            loading ? "bg-gray-400" : "bg-yellow-600"
          }`}
          disabled={loading} // Correct way to conditionally disable the button
        >
          {loading ? (
            <>
              <Spinner />{" "}
              {/* Assuming Spinner is an icon or loading component */}
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

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirestore, collection, addDoc, setDoc, doc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import platformImage from "../assets/png/platform.png";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    typeOfAdmin: "",
    firstName: "",
    lastName: "",
    legalName: "",
    businessRegNumber: "",
    city: "",
    postalCode: "",
    document: [],
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, document: Array.from(e.target.files) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore();
    const auth = getAuth();
    const storage = getStorage();

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password ||
      !formData.phone ||
      !formData.typeOfAdmin ||
      !formData.legalName ||
      !formData.businessRegNumber ||
      !formData.city ||
      !formData.postalCode
    ) {
      setError("All fields must be filled out.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password should be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    const phonePattern = /^9\d{9}$/;
    if (!phonePattern.test(formData.phone)) {
      setError("Phone number must follow the format 9XXXXXXXXX.");
      return;
    }

    if (!formData.document || formData.document.length === 0) {
      setError("You must upload at least one document.");
      return;
    }

    try {
      // Step 1: Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Step 2: Upload documents to Firebase Storage
      const uploadedFiles = [];
      for (const file of formData.document) {
        const fileRef = ref(storage, `documents/${user.uid}/${file.name}`);
        await uploadBytes(fileRef, file);
        uploadedFiles.push({
          name: file.name,
          url: `documents/${user.uid}/${file.name}`,
        });
      }

      // Step 3: Add user data to Firestore 'users' collection with matching UID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        typeOfAdmin: formData.typeOfAdmin,
        legalName: formData.legalName,
        businessRegNumber: formData.businessRegNumber,
        city: formData.city,
        postalCode: formData.postalCode,
        documentFiles: uploadedFiles,
        isApproved: false,
        createdAt: new Date(),
      });

      // Step 4: Navigate to the 'for-approval' page
      navigate("/for-approval");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 p-10">
        <section>
          <div className="p-4">
            <h2 className="font-bold text-yellow-900 text-2xl md:text-3xl text-center">
              Register your account as Veterinary and Animal Shelter Admin
            </h2>
            <img
              src={platformImage}
              alt="Laptop and phone with InnoPetCare"
              className="max-w-full h-auto select-none"
            />
          </div>
        </section>
        <section>
          <div>
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 w-3/4 mx-auto">
              <div className="text-center mb-6">
                <img
                  src="/images/innopetcare-black.png"
                  alt="InnoPetCare Logo"
                  className="mx-auto mb-4"
                />
              </div>
              {error && <p className="text-red-500 mb-4">{error}</p>}

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label htmlFor="typeOfAdmin" className="block font-medium">
                    Type of Admin
                  </label>
                  <select
                    name="typeOfAdmin" // Add name here for controlled component
                    className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    value={formData.typeOfAdmin}
                    onChange={handleChange}
                  >
                    {/* <option value="">Select Admin Type</option>{" "} */}
                    {/* Default option */}
                    <option value="Veterinary Admin">Veterinary Admin</option>
                    <option value="Animal Shelter Admin">
                      Animal Shelter Admin
                    </option>
                  </select>
                </div>
                <div>
                  <label htmlFor="firstName" className="block font-medium">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block font-medium">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block font-medium">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"} // Toggle between text and password
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="block w-full border rounded-md px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}{" "}
                      {/* Icon based on visibility state */}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="block font-medium"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone (Format: 9XXXXXXXXX)
                  </label>
                  
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="legalName" className="block font-medium">
                    Legal Name/Company Name
                  </label>
                  <input
                    type="text"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="businessRegNumber"
                    className="block font-medium"
                  >
                    Business Registration Number
                  </label>
                  <input
                    type="text"
                    name="businessRegNumber"
                    value={formData.businessRegNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block font-medium">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block font-medium">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <h3 className="text-lg font-semibold mb-4">
                  Document and Policy
                </h3>
                <div className="mb-5">
                  <label
                    htmlFor="document"
                    className="block text-gray-500 mb-2"
                  >
                    Upload Document
                  </label>
                  <p className="text-sm text-gray-600 mb-2">
                    You should upload these documents (PDF or image formats,
                    .jpg, .png are accepted):
                  </p>
                  <ul className="list-disc list-inside mb-2">
                    <li>Business Permit</li>
                    <li>Veterinary Clinic License (For Veterinary only)</li>
                    <li>Animal Welfare License (For Animal Shelter only)</li>
                    <li>DTI Business Name</li>
                    <li>Sanitary Permit</li>
                    <li>Environmental Compliance</li>
                    <li>Tax Identification Number (TIN)</li>
                    <li>Bureau of Animal Industry Recognition</li>
                    <li>Valid Identification (Government-Issued)</li>
                  </ul>
                  <input
                    type="file"
                    name="document"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    multiple
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-yellow-500 text-white rounded-md py-2 mt-4"
                >
                  Register
                </button>
              </form>
              <p className="text-center mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-yellow-500 font-semibold">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Register;

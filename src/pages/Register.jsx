import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import platformImage from "../assets/png/platform.png";
import Register1 from "./Register1";
import Register2 from "./Register2";
import Register3 from "./Register3";

export default function Register() {
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [currentStep, setCurrentStep] = useState(1); // Track current step

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    firstName: "",
    lastName: "",
    legalName: "",
    businessRegNumber: "",
    city: "",
    postalCode: "",
    document: "", // if there is a file upload in Register3
    policyAgreed: false, // for Register3
  });

  const navigate = useNavigate();
  
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

  // Handle going to the next step
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle going back to the previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFieldChange = (newFormData) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newFormData,
    }));
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
            <div className="text-sm text-center">
              <ul className="steps steps-vertical lg:steps-horizontal">
                <li className={`step ${currentStep >= 1 ? "step-info" : ""}`}>
                  Register
                </li>
                <li className={`step ${currentStep >= 2 ? "step-info" : ""}`}>
                  Fill in Business Registration
                </li>
                <li className={`step ${currentStep === 3 ? "step-info" : ""}`}>
                  Document and Policy
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 w-3/4 mx-auto">
              <div className="text-center mb-6">
                <img
                  src="/images/innopetcare-black.png"
                  alt="InnoPetCare Logo"
                  className="mx-auto mb-4"
                />
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
              {(() => {
                switch (currentStep) {
                  case 1:
                    return (
                      <Register1
                        formData={formData}
                        setError={setError}
                        onChange={handleFieldChange}
                        nextStep={nextStep} // Pass the nextStep function
                      />
                    );
                  case 2:
                    return (
                      <Register2
                        formData={formData}
                        setError={setError}
                        onChange={handleFieldChange}
                        nextStep={nextStep} // Pass the nextStep function

                      />
                    );
                  case 3:
                    return (
                      <Register3
                        formData={formData}
                        setError={setError}
                        onChange={handleFieldChange}
                      />
                    );
                  default:
                    return null;
                }
              })()}

             
              <p className="text-sm text-center text-gray-600 mt-5">
                Already Registered?{" "}
                <span className="text-sm text-yellow-600 hover:underline hover:text-yellow-800 transition duration-200 ease-in-out">
                  <Link to="/login">Login</Link>
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

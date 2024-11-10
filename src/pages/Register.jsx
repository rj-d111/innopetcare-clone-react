import { useEffect, useState } from "react";
import Register1 from "./Register1";
import Register2 from "./Register2";
import Register3 from "./Register3";
import { useNavigate } from "react-router-dom";
import platformImage from "../assets/png/platform.png";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';

function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: {
      typeOfAdmin: "",
      name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
    step2: {
      firstName: "",
      lastName: "",
      legalName: "",
      businessRegNumber: "",
      city: "",
      postalCode: "",
    },
    step3: { document: [] }, // Initialize document as an empty array
  });

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (currentStep >= 2) {
        const message = "Are you sure you want to quit? Unsaved changes will be lost.";
        e.returnValue = message; // Standard for beforeunload event
        return message;
      }
    };
  
    const handlePopState = () => {
      if (currentStep >= 2) {
        const userConfirmed = window.confirm("Are you sure you want to quit? Unsaved changes will be lost.");
        if (!userConfirmed) {
          // No navigation if user cancels; we don't call navigate here
          window.history.pushState(null, document.title, window.location.href);
        }
      }
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentStep]);
  
  
  const handleLinkClick = (e) => {
    if (currentStep >= 2) {
      const userConfirmed = window.confirm(
        "Are you sure you want to quit? Unsaved changes will be lost."
      );
      if (!userConfirmed) {
        e.preventDefault(); // Prevents navigation if the user cancels
        return;
      }
    }
    navigate("/login"); // Navigates if user confirms
  };

  const handleFormDataChange = (step, updatedData) => {
    setFormData((prevData) => ({
      ...prevData,
      [step]: { ...prevData[step], ...updatedData },
    }));
  };

  const handleFileChange = (newFiles) => {
    setFormData((prevData) => ({
      ...prevData,
      step3: {
        ...prevData.step3,
        document: [...newFiles], // Set the new list directly
      },
    }));
  };

  const goToNextStep = () => setCurrentStep((prev) => prev + 1);
  const goToPreviousStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    const auth = getAuth();
    const { typeOfAdmin, name, email, phone, password } = formData.step1;
    const { businessRegNumber, city, postalCode, firstName, lastName } = formData.step2;
    const documentFiles = formData.step3.document;

    try {
      // Step 1: Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Step 2: Save user information to the users collection
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, {
        name,
        email,
        phone,
        profileImage: "https://innopetcare.com/_services/unknown_user.jpg",
        status: "pending",
        accountCreated: serverTimestamp(),
        lastActivityTime: serverTimestamp(),
      });

      // Step 3: Save business information to the projects collection
      const projectDocRef = doc(collection(db, "projects"));
      await setDoc(projectDocRef, {
        businessRegNumber,
        city,
        createdAt: serverTimestamp(),
        documentFiles,
        name: formData.step2.legalName, // Legal business name
        postalCode,
        status: "pending",
        type: typeOfAdmin === "Veterinary Admin" ? "Veterinary Site" : "Animal Shelter Site",
        userId,
        firstName,
        lastName,
      });

      toast.success("Successfully registered to InnoPetCare");
      // Step 4: Navigate to the pending page
      navigate("/pending");
    } catch (error) {
      console.error("Error registering user:", error);
      // Add error handling here (e.g., display error message)
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-10">
      <section className="hidden md:block">
        {/* Left section content */}
        <section className="hidden md:block">
          <div className="p-4">
            <h2 className="font-bold text-yellow-900 text-2xl md:text-3xl text-center">
              Register your account as Veterinary and Animal Shelter Admin
            </h2>
            <p className="text-center mt-4">
              Already have an account?{" "}
              <button
                onClick={handleLinkClick}
                className="text-yellow-500 font-semibold"
              >
                Login here
              </button>
            </p>
            <img
              src={platformImage}
              alt="Laptop and phone with InnoPetCare"
              className="max-w-full h-auto select-none"
            />
          </div>
        </section>
        {/* End of Left section content */}
      </section>
      <section>
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 md:w-3/4 mx-auto">
          <img
            src="/images/innopetcare-black.png"
            alt="InnoPetCare Logo"
            className="mx-auto mb-4 select-none"
          />
          {/* Steps */}
          <div className="my-5">
            <ul className="steps steps-vertical lg:steps-horizontal w-full">
              <li className="step step-primary">Registration</li>
              <li className={`step ${currentStep >= 2 && "step-primary"}`}>
                Business Infomration
              </li>
              <li className={`step ${currentStep >= 3 && "step-primary"}`}>
                Document and Policy
              </li>
            </ul>
          </div>

          {currentStep === 1 && (
            <Register1
              formData={formData.step1}
              onChange={(updatedData) =>
                handleFormDataChange("step1", updatedData)
              }
              onNext={goToNextStep}
            />
          )}
          {currentStep === 2 && (
            <Register2
              formData={formData.step2}
              onChange={(updatedData) =>
                handleFormDataChange("step2", updatedData)
              }
              onPrevious={goToPreviousStep}
              onNext={goToNextStep}
            />
          )}
          {currentStep === 3 && (
            <Register3
              formData={formData.step3}
              onChange={handleFileChange} // Pass handleFileChange to manage multiple files
              onPrevious={goToPreviousStep}
              onSubmit={handleSubmit}
            />
          )}
          <p className="text-center mt-4">
            Already have an account?{" "}
            <button
              onClick={handleLinkClick}
              className="text-yellow-500 font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Register;

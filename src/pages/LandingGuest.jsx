import React from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import InnnoPetCareBrownLogo from "../assets/png/innopetcare-brown.png";
import PlatformImage from "../assets/png/platform.png";
// import BackgroundPet from '../assets/jpg/background-pet.jpg';
import AnimalGuest from "../assets/jpg/animal-guest.jpg";
import FutureGuest from "../assets/jpg/future-guest.jpg";
import PetGuest from "../assets/jpg/pet-guest.jpg";
import VeterinaryGuest from "../assets/jpg/veterinary-guest.jpg";

export default function LandingGuest() {
  const navigate = useNavigate(); // Hook for navigation

  const handleLearnMore = () => {
    navigate("/about"); // Redirect to about page
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div
        className="relative bg-cover bg-bottom h-[90vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${PetGuest})` }}
      >
        <div className="absolute top-0 left-0 right-0 text-center mt-8">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-800 mb-4">
            Discover the future of pet care with <br />
          </h1>
          <img
            src={InnnoPetCareBrownLogo}
            alt="InnoPetCare Logo"
            className="mx-auto w-48 md:w-64"
          />
        </div>
      </div>

      <div className="py-12 px-4 md:px-16 bg-white h-[90vh]">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left side (Image) */}
          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
            <img
              src={PlatformImage}
              alt="Platform"
              className="w-full max-w-lg rounded-lg"
            />
          </div>

          {/* Right side (Content) */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="flex items-center text-3xl md:text-5xl font-bold text-yellow-900 mb-6">
              What is{" "}
              <img
                src={InnnoPetCareBrownLogo}
                alt="InnoPetCare"
                className="inline-block w-48 md:w-64 ml-2" // Add margin to the left for spacing
              />{" "}
              ?
            </h2>
            <p className="text-gray-600 mb-8">
              InnoPetCare is a platform that empowers veterinary clinics and
              animal shelters to create their own sites. Our goal is to make it
              easier for pet owners to find the resources and care they need,
              and for those who care for pets in shelters to find ways to get
              involved, such as volunteering, donating, or adopting.
            </p>
            <button
              onClick={handleLearnMore}
              className="bg-yellow-800 text-white px-8 py-3 rounded-md hover:bg-yellow-700 transition-colors duration-300"
            >
              Learn more about us
            </button>
          </div>
        </div>
      </div>

      {/* Guest Animals Section */}
      <div className="py-12 bg-gray-100">
        <h3 className="text-2xl md:text-3xl font-bold text-brown-700 text-center mb-8">
          Meet some of our furry friends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <img
            src={AnimalGuest}
            alt="Animal Guest"
            className="rounded-lg shadow-lg"
          />
          <img
            src={FutureGuest}
            alt="Future Guest"
            className="rounded-lg shadow-lg"
          />
          <img
            src={PetGuest}
            alt="Pet Guest"
            className="rounded-lg shadow-lg"
          />
          <img
            src={VeterinaryGuest}
            alt="Veterinary Guest"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

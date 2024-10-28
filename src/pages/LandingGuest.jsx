import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // For navigation
import InnnoPetCareBrownLogo from "../assets/png/innopetcare-brown.png";
import PlatformImage from "../assets/png/platform.png";
import AnimalGuest from "../assets/jpg/animal-guest.jpg";
import FutureGuest from "../assets/jpg/future-guest.jpg";
import PetGuest from "../assets/jpg/pet-guest.jpg";
import AdoptPet from "../assets/png/adopt_pet.png";
import VeterinaryGuest from "../assets/jpg/veterinary-guest.jpg";
import Footer from "../components/Footer";
import AnimalShelterSitesModal from "../components/AnimalShelterSitesModal";

export default function LandingGuest() {
  const navigate = useNavigate(); // Hook for navigation

  const handleLearnMore = () => {
    navigate("/about"); // Redirect to about page
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

      {/* About Section */}
      <div className="py-12 px-4 md:px-16 bg-white md:h-[90vh]">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left side (Image) */}
          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
            <img
              src={PlatformImage}
              alt="Platform"
              className="w-full max-w-lg rounded-lg select-none"
            />
          </div>

          {/* Right side (Content) */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-bold text-yellow-900 mb-6">
              What is{" "}
              <img
                src={InnnoPetCareBrownLogo}
                alt="InnoPetCare"
                className="inline-block w-48 md:w-72 ml-2 pb-3"
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
              className="bg-yellow-800 text-white px-8 py-3 rounded-md hover:bg-yellow-700 transition-colors duration-300 select-none"
            >
              Learn more about us
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <h2 className="text-4xl font-bold bg-yellow-50  text-yellow-800 p-8 text-center">
          Benefits of
          <img
            src={InnnoPetCareBrownLogo}
            alt="InnoPetCare Logo"
            className="mx-auto w-48 md:w-64 select-none"
          />
        </h2>

      {/* Veterinary Clinic Owner */}
      <div className="flex flex-col md:flex-row bg-yellow-50 p-8 rounded-lg shadow-lg items-center">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0 select-none">
          <img
            src={VeterinaryGuest}
            alt="Cat Consultation"
            className="rounded-lg"
          />
        </div>
        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 md:pl-8">
          <h3 className="text-lg text-gray-700">If you are a</h3>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-900 mb-4">
            Veterinary Clinic Owner
          </h2>
          <p className="text-gray-700 mb-4">
            With InnoPetCare you can create your own site that:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>Promote your clinic and showcase your services, etc.</li>
            <li>Potentially attract new clients</li>
            <li>
              Manage appointments, patient records, and communications
              efficiently.
            </li>
            <li>
              Support animal shelters with our special feature that will be
              added in your site.
            </li>
          </ul>
          <div className="flex items-center mb-4 justify-center">
            <button
              onClick={openModal}
              className="focus:outline-none select-none"
            >
              <img
                src={AdoptPet}
                alt="Adopt Pet"
                className="w-32 h-32 cursor-pointer"
              />
            </button>
          </div>
          <p className="text-gray-700 mb-4">
            This feature will automatically link to a page displaying all animal
            shelters that use InnoPetCare. By doing this, you can help promote
            these shelters and contribute to the rescue of animals.
          </p>
          <div className="flex justify-end">
            <Link
              to="/register"
              className="bg-yellow-800 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors duration-300 select-none"
            >
              Create your Vet Clinic Site Now!
            </Link>
          </div>
        </div>
      </div>

      {/* Animal Owner Site */}
      <div className="flex flex-col md:flex-row-reverse bg-yellow-50 p-8 rounded-lg shadow-lg items-center">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0 select-none">
          <img
            src={AnimalGuest}
            alt="Animal Volunteer"
            className="rounded-lg"
          />
        </div>
        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 md:pl-8">
          <h3 className="text-lg text-gray-700">If you are a</h3>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-900 mb-4">
            Animal Shelter Owner
          </h2>
          <p className="text-gray-700 mb-4">
            With InnoPetCare you can create your own site that:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>
              Promote your shelter by displaying adoptable pets in the shelter,
              the benefits of donating, and volunteering.
            </li>
            <li>
              Manage shelter visitor appointments and communications
              efficiently.
            </li>
            <li>
              Also, your site will be automatically added to a list of shelters
              that is prominently displayed on the 'Adopt Pet', a special
              feature that is added in all veterinary clinics that use
              InnoPetCare.
            </li>
          </ul>
          <div className="flex items-center mb-4 justify-center">
            <button
              onClick={openModal}
              className="focus:outline-none select-none"
            >
              <img
                src={AdoptPet}
                alt="Adopt Pet"
                className="w-32 h-32 cursor-pointer"
              />
            </button>
          </div>
          <p className="text-gray-700 mb-4">
            By joining InnoPetCare, you're giving your shelter maximum
            visibility and increasing your chances of finding loving homes for
            your animals.
          </p>
          <div className="flex justify-end">
            <Link
              to="/register"
              className="bg-yellow-800 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors duration-300 select-none"
            >
              Create your Animal Shelter Site Now!
            </Link>
          </div>
        </div>
      </div>

      {/* Future Owner */}
      <div className="flex flex-col md:flex-row bg-yellow-50 p-8 rounded-lg shadow-lg items-center">
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0 select-none">
          <img src={FutureGuest} alt="Future Owner" className="rounded-lg" />
        </div>
        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 md:pl-8">
          <h3 className="text-lg text-gray-700">If you are a</h3>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-900 mb-4">
            Future Owner/Future Pet Owners
          </h2>
          <p className="text-gray-700 mb-4">with InnoPetCare</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>You can easily find Veterinary Clinics and Animal Shelter.</li>
            <li>
              On the Veterinary Clinics site once you have an account you can
              now book appointments, view your pet’s medical records, and
              communicate with the veterinary clinic.
            </li>
          </ul>
          <h3 className="text-lg text-gray-700">
            If you want to{" "}
            <span className="font-bold text-black">
              adopt a pet, donate, volunteer, or even visit a
            </span>
          </h3>

          <h2 className="text-2xl md:text-3xl font-bold text-yellow-900 mb-4">
            Animal Shelter{" "}
          </h2>
          <p className="text-gray-700 mb-4">with InnoPetCare</p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>You can easily find Animal Shelter and browse their sites.</li>
            <li>
              You can see the Shelter's History, Location, Adoptable Pets, and
              more information about the shelter in their sites.
            </li>
            <li>
              Once you have an account, you can set your visit appointment, and
              communicate with them easily.
            </li>
          </ul>

          <div className="flex justify-end">
            <Link
              to="/sites"
              className="bg-yellow-800 text-white px-6 py-2 rounded-md hover:bg-yellow-700 transition-colors duration-300 select-none"
            >
              View list of Veterinary Clinics & Shelter{" "}
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      {/* Render the Animal Shelter Sites Modal */}
      <AnimalShelterSitesModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

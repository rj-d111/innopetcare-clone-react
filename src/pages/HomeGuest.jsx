import React from "react";
import BackgroundPet from "../assets/jpg/background-pet.jpg";
import PlatformImage from "../assets/png/platform.png";
import { useNavigate } from "react-router";
import Footer from "../components/Footer";
import CatLeft from "../assets/png/cat-left.png";
import DogRight from "../assets/png/dog-right.png";
import InnoPetCareBrownLogo from "../assets/png/innopetcare-brown.png";

export default function HomeGuest() {
  const navigate = useNavigate();

  return (
    <>
      <section className="h-[100vh] flex items-center justify-center relative">
        <img
          src={CatLeft}
          alt="Cat on the left"
          className="absolute left-0 top-0 w-1/2  h-full object-cover hidden lg:block" // Extend the image to the whole viewport
        />
        <img
          src={DogRight}
          alt="Dog on the right"
          className="absolute right-0 bottom-0 w-1/4 object-cover hidden lg:block" // Retain the previous size for the dog image
        />
        <div className="container text-center mx-auto py-16 relative z-10 px-8 md:px-0">
          {" "}
          {/* Add z-10 for text above the image */}
          <h1 className="text-4xl md:text-6xl font-bold text-yellow-900">
            Welcome to
            <img
              onClick={() => navigate("/")}
              src={InnoPetCareBrownLogo}
              alt="Innopetcare logo"
              className="w-full sm:w-auto sm:h-12 mx-auto mt-4 cursor-pointer"
            />
          </h1>
          <p className="my-5 font-bold text-lg text-zinc-700">
            InnoPetCare is your ultimate solution for transforming veterinary
            clinics <br /> and animal shelters into thriving centers of pet
            care.
          </p>
          <button
            onClick={() => navigate("/about")}
            className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-10 rounded-lg font-semibold shadow-md hover:shadow-lg active:shadow-lg transition duration-200 ease-in-out"
          >
            About Us
          </button>
        </div>
      </section>

      <div
        className="bg-cover bg-bottom py-8 md:py-0 md:h-[100vh] flex flex-col justify-center"
        style={{ backgroundImage: `url(${BackgroundPet})` }}
      >
        <h1 className="text-2xl md:text-6xl font-bold text-white text-center mb-10">
          Your furry friends deserve the best.
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 md:mx-10">
          {/* Login Card */}
          <div className="card bg-base-100 shadow-xl w-full">
            <div className="card-body items-center text-center">
              <h2 className="card-title">For Vet and Shelter Admin</h2>
              <p className="text-sm">
                Access your dashboard to manage your activities, appointments,
                and more. Ready to continue your journey with us? Click below to
                proceed!
              </p>
              <div className="card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/login")}
                >
                  Proceed to Login
                </button>
              </div>
            </div>
          </div>

          {/* Vet and Shelter Admin Card */}
          <div className="card bg-base-100 shadow-xl w-full">
            <div className="card-body items-center text-center">
              <h2 className="card-title">For Vet and Shelter Admin</h2>
              <p className="text-sm">
                Manage appointments, pet records, and shelter details.
                Administer the system efficiently with this dashboard.
              </p>
              <div className="card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/register")}
                >
                  Proceed to Register
                </button>
              </div>
            </div>
          </div>

          {/* Customers Card */}
          <div className="card bg-base-100 shadow-xl w-full">
            <div className="card-body items-center text-center">
              <h2 className="card-title">For Customers</h2>
              <p className="text-sm">
                Browse available pets, schedule appointments, and interact with
                shelters. Your one-stop solution for pet adoption and care.
              </p>
              <div className="card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/sites")}
                >
                  Proceed to Content Listing
                </button>
              </div>
            </div>
          </div>

          {/* Guest Card */}
          <div className="card bg-base-100 shadow-xl w-full">
            <div className="card-body items-center text-center">
              <h2 className="card-title">For Guest</h2>
              <p className="text-sm">
                Explore available pets and resources. Sign up to access more
                features and keep track of your activities.
              </p>
              <div className="card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/landing-guest")}
                >
                  Explore as Guest
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-5 m-3 md:m-10">
        <img
          src={PlatformImage}
          alt=""
          className="w-full md:w-1/2 object-cover"
        />
        <p className="md:flex md:items-center text-justify text-lg text-slate-900 md:font-medium">
          We at InnoPetCare are passionate about animal care. To support this
          passion, we offer a special feature that can be added to your
          veterinary clinic website at no extra cost. This feature will
          automatically link to a page showcasing all animal shelters that use
          InnoPetCare. By doing this, you can help promote these shelters and
          contribute to the rescue of animals.
        </p>
      </section>

      <Footer />
    </>
  );
}

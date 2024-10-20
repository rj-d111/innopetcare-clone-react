import React from "react";
import BackgroundPet from "../assets/jpg/background-pet.jpg";
import PlatformImage from "../assets/png/platform.png";
import { useNavigate } from "react-router";

export default function HomeGuest() {

  const navigate = useNavigate();
  
  return (
    <>
    <section className="h-[100vh] flex items-center justify-center">
  <div className="container text-center mx-auto py-16">
    <h1 className="text-4xl md:text-6xl font-bold text-slate-900">
      Welcome to
      <img
        onClick={() => navigate("/")}
        src="/images/innopetcare-white.png"
        alt="Innopetcare logo"
        className="h-18 mx-auto mt-4 cursor-pointer invert"
      />
    </h1>
    <p className="my-5 font-bold text-lg text-zinc-700">
      InnoPetCare is your ultimate solution for transforming veterinary
      clinics <br /> and animal shelters into thriving centers of pet care.
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
  className="bg-cover bg-bottom h-[100vh] flex flex-col justify-center"
  style={{ backgroundImage: `url(${BackgroundPet})` }}
>
  <h1 className="text-2xl md:text-6xl font-bold text-white text-center mb-10">
    Your furry friends deserve the best.
  </h1>
  
  <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:mx-10">
    {/* Vet and Shelter Admin Card */}
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body items-center text-center">
        <h2 className="card-title">For Vet and Shelter Admin</h2>
        <p className="text-sm">
          Manage appointments, pet records, and shelter details. Administer
          the system efficiently with this dashboard.
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
          <button className="btn btn-primary">Explore as Guest</button>
        </div>
      </div>
    </div>
  </section>
</div>



      <section className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-5 m-3 md:m-10">
        <img src={PlatformImage} alt="" className="w-full md:w-1/2" />
        <p className="flex items-center text-lg text-slate-900 font-medium">
          We at InnoPetCare are passionate about animal care. To support this
          passion, we offer a special feature that can be added to your
          veterinary clinic website at no extra cost. This feature will
          automatically link to a page showcasing all animal shelters that use
          InnoPetCare. By doing this, you can help promote these shelters and
          contribute to the rescue of animals.
        </p>
      </section>
    </>
  );
}

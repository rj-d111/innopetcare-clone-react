import React from "react";
import BackgroundPet from "../assets/jpg/background-pet.jpg";
import PlatformImage from "../assets/png/platform.png";

export default function HomeGuest() {
  return (
    <>
      <section
        className="bg-cover bg-bottom pt-40"
        style={{ backgroundImage: `url(${BackgroundPet})` }}
      >
        <div className="container mx-auto text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Your furry friends deserve the best.
          </h1>
          <p className="text-xl md:text-2xl text-white mt-4">
            Create a website that reflects your passion for animal care with our
            easy-to-use CMS. No coding required!
          </p>
          <a
            href="/login"
            className="inline-block mt-8 bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold"
          >
            Get Started
          </a>
        </div>
      </section>

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

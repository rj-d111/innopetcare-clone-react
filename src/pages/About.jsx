import React from "react";
import DogBasket from "../assets/png/dog-basket.png";
import InnoPetCareBrownIcon from "../assets/png/InnoPetCareICON_brown.png";
import InnoPetCareTextLogo from "../assets/png/innopetcare-brown.png";
import { Link } from "react-router-dom";
import DogHelp from "../assets/png/dog-help.png";
import DogBunch from "../assets/png/dog-bunch.png";
import Footer from "../components/Footer";

export default function About() {
  return (
    <>
      <div className="bg-yellow-100 min-h-screen p-8">
        {/* Back Button */}
        <Link
          className="py-2 px-10 rounded-full font-medium select-none border text-yellow-800 dark:text-white bg-white dark:bg-yellow-800 transition-colors hover:border-yellow-900 hover:bg-yellow-900 hover:text-white dark:hover:text-white mb-8 self-start"
          to="/"
        >
          ⪻ Back
        </Link>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left mb-8">
          {/* Left Side */}
          <div className="flex flex-col items-center md:items-start md:w-1/2">
            <h1 className="text-4xl md:text-7xl font-bold text-yellow-900 my-2">
              About
            </h1>
            <img
              src={InnoPetCareTextLogo}
              alt="InnoPetCare Logo"
              className="w-48 md:w-[40vw]"
            />
          </div>

          {/* Right Side */}
          <div className="mt-6 md:mt-0 md:w-1/2 flex justify-center md:justify-end">
            <img
              src={DogBasket}
              alt="Dog Basket"
              className="w-48 md:w-[40vw] rounded-lg"
            />
          </div>
        </div>

        {/* Mission, Vision, Core Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Our Mission */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <img
                src={InnoPetCareBrownIcon}
                alt="Mission Icon"
                className="w-8 h-8 mr-2"
              />
              <h2 className="text-xl font-bold text-yellow-900">Our Mission</h2>
            </div>
            <p className="text-gray-700">
              At InnoPetCare, our mission is to empower veterinary clinics and
              animal shelters with innovative solutions that enhance pet care
              and streamline operations. We are dedicated to providing tools
              that enable organizations to focus on delivering exceptional
              service to pets and their owners.
            </p>
          </div>

          {/* Our Vision */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <img
                src={InnoPetCareBrownIcon}
                alt="Vision Icon"
                className="w-8 h-8 mr-2"
              />
              <h2 className="text-xl font-bold text-yellow-900">Our Vision</h2>
            </div>
            <p className="text-gray-700">
              We envision a future where every pet receives the highest standard
              of care, supported by well-equipped clinics and shelters that
              thrive in their communities. We aim to foster a world where
              technology and compassion come together to improve animal welfare.
            </p>
          </div>

          {/* Core Values */}
          <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <img
                src={InnoPetCareBrownIcon}
                alt="Core Values Icon"
                className="w-8 h-8 mr-2"
              />
              <h2 className="text-xl font-bold text-yellow-900">Core Values</h2>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <span className="font-bold">Compassion:</span> We believe in
                prioritizing the well-being of pets and the people who care for
                them.
              </li>
              <li>
                <span className="font-bold">Innovation:</span> We are committed
                to developing cutting-edge solutions that address the evolving
                needs of veterinary clinics and animal shelters.
              </li>
              <li>
                <span className="font-bold">Collaboration:</span> We work
                closely with veterinary professionals and shelters to understand
                their challenges and create tailored tools that empower them.
              </li>
              <li>
                <span className="font-bold">Integrity:</span> We operate with
                transparency and honesty, ensuring our clients can trust us to
                support their mission.
              </li>
            </ul>
          </div>
        </div>

        {/* Our Background Section */}
        <div className="flex flex-col md:flex-row items-center justify-between   ">
          {/* Left Content Section */}
          <div className="md:w-1/2 bg-white p-10 rounded-lg shadow-lg">
            <div className="text-center md:text-left mb-6">
              <img
                src={DogBunch}
                alt="Group of dogs"
                className="w-auto mx-auto md:mx-0"
              />
            </div>
            <div>
              <div className="flex items-center mb-4">
                <img
                  src={InnoPetCareBrownIcon}
                  alt="Vision Icon"
                  className="w-8 h-8 mr-2"
                />
                <h2 className="text-xl font-bold text-yellow-900">
                  Our Background
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                InnoPetCare was founded by a team of animal lovers and tech
                enthusiasts who recognized the challenges faced by veterinary
                clinics and animal shelters. With years of experience in both
                veterinary care and technology development, we set out to create
                a platform that bridges the gap between compassionate care and
                efficient management. Today, we are proud to support
                organizations across the country in their vital work, making a
                positive impact in the lives of pets and their communities.
              </p>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0">
            <img
              src={DogHelp}
              alt="Dog and human handshake"
              className="w-3/4 md:w-full rounded-lg"
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

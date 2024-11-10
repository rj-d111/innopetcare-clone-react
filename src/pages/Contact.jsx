import React from 'react';
import { FaEnvelope, FaFacebook } from 'react-icons/fa';
import InnoPetCareYellow from '../assets/png/InnoPetCareICON_APP.png';
import InnoPetCareBrown from '../assets/png/innopetcare-brown.png';

export default function Contact() {
  return (
    <div className="flex flex-col md:flex-row items-center md:justify-center h-[calc(100vh-64px)] p-6 bg-white text-center md:text-left max-w-4xl mx-auto">
      
      {/* Left Column - Logo */}
      <div className="flex justify-center md:justify-end mb-6 md:mb-0 mr-6">
        <img
          src={InnoPetCareYellow}
          alt="InnoPetCare Icon"
          className="w-32 h-32 md:w-64 md:h-64 rounded-full shadow-lg transition-transform transform hover:scale-105"
        />
      </div>

      {/* Right Column - Contact Info */}
      <div className="md:w-1/2 flex flex-col items-center md:items-start space-y-4 md:self-center">
        
        <p className="text-sm text-yellow-800">Need assistance? Contact our support team.</p>
        
        {/* InnoPetCare Brown Image */}
        <img
          src={InnoPetCareBrown}
          alt="InnoPetCare Logo"
          className="w-48 h-auto mb-4"
        />

        <h2 className="text-xl font-semibold text-yellow-800">Contact Us</h2>

        {/* Email Link */}
        <a
          href="mailto:innopetcare@gmail.com"
          className="flex items-center space-x-2 text-gray-800 hover:text-yellow-600 transition"
        >
          <FaEnvelope className="text-2xl" />
          <span className="text-lg">innopetcare@gmail.com</span>
        </a>

        {/* Facebook Link */}
        <a
          href="https://facebook.com/InnoPetCare"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-gray-800 hover:text-yellow-600 transition"
        >
          <FaFacebook className="text-2xl" />
          <span className="text-lg">InnoPetCare @InnoPetCare</span>
        </a>
      </div>
    </div>
  );
}

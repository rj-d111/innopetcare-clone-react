import React from 'react';
import { FaFacebook, FaYoutube } from 'react-icons/fa';
import InnoPetCareLogo from '../assets/png/innopetcare-black.png'; // Path to the logo
import { Link } from 'react-router-dom';

const Footer = () => {
  function CurrentYear() {
    const year = new Date().getFullYear();
    return year;
  }

  return (
    <footer className="bg-gray-100 py-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo and Description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img src={InnoPetCareLogo} alt="InnoPetCare" className="h-10 mb-4" />
          <p className="text-gray-600 mb-4">
            InnoPetCare is a content management system (CMS) designed specifically for veterinary clinics and animal shelters to manage their online presence.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-black"><FaFacebook size={24} /></a>
            <a href="#" className="text-black"><FaYoutube size={24} /></a>
          </div>
        </div>

        {/* Company Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link to="about" className="text-gray-600 hover:underline">About InnoPetCare</Link></li>
            <li><a href="#" className="text-gray-600 hover:underline">Contact Us</a></li>
          </ul>
        </div>

        {/* Products and Resources */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="font-semibold mb-4">Products</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-600 hover:underline">For Veterinary Clinic</a></li>
            <li><a href="#" className="text-gray-600 hover:underline">For Animal Shelter</a></li>
          </ul>

          <h3 className="font-semibold mt-6 mb-4">Resources</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-600 hover:underline">Templates</a></li>
            <li><a href="#" className="text-gray-600 hover:underline">Tutorials</a></li>
            <li><a href="#" className="text-gray-600 hover:underline">Help Center</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 border-t border-gray-300 pt-4 text-center">
        <p className="text-gray-600">
          &copy; {CurrentYear()} InnoPetCare, All Rights Reserved
        </p>
        <p className="text-gray-600">
          <a href="#" className="hover:underline">Terms Of Use</a> | <a href="#" className="hover:underline">Privacy Policy</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
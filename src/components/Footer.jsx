import React, { useState, useEffect } from "react";
import { FaFacebook, FaYoutube } from "react-icons/fa";
import InnoPetCareLogo from "../assets/png/innopetcare-black.png";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Footer = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set true if user is logged in, false otherwise
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [auth]);

  function CurrentYear() {
    return new Date().getFullYear();
  }

  return (
    <footer className="bg-gray-100 py-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo and Description */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img src={InnoPetCareLogo} alt="InnoPetCare" className="h-10 mb-4" />
          <p className="text-gray-600 mb-4">
            InnoPetCare is a content management system (CMS) designed
            specifically for veterinary clinics and animal shelters to manage
            their online presence.
          </p>
        </div>

        {/* Company Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="text-gray-600 hover:underline">
                About InnoPetCare
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-600 hover:underline">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Conditionally Render Services Section */}
        {!isAuthenticated && (
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-gray-600 hover:underline">
                  For Veterinary Clinic
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:underline">
                  For Animal Shelter
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 border-t border-gray-300 pt-4 text-center">
        <p className="text-gray-600">
          &copy; {CurrentYear()} InnoPetCare, All Rights Reserved
        </p>
        <p className="text-gray-600">
          
            <Link
              to="/terms-and-conditions"
              className="text-gray-600 hover:underline"
            >
              Terms and Conditions
            </Link>

            <span className="px-3">|</span>
          
        
            <Link
              to="/privacy-policy"
              className="text-gray-600 hover:underline"
            >
              Privacy Policy
            </Link>
          
        </p>
      </div>
    </footer>
  );
};

export default Footer;

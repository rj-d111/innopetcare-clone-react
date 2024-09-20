import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation

export default function Header() {

  const [pageState, setPageState] = useState("Sign in");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(()=>{
    onAuthStateChanged(auth, (user)=>{
      if(user){
        setPageState("Profile");
      }else{
        setPageState("Sign in");
      }
    })
  });
  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true;
    }
  }
  return (
    <header className="flex justify-between items-center p-4 bg-yellow-900">
    <img
      onClick={() => navigate("/")}
      src="/images/innopetcare-white.png"
      alt="Innopetcare logo"
      className="h-8 cursor-pointer"
    />
    <div className="hidden md:block">
      <ul className="flex space-x-4 items-center"> {/* Add flex here to ul and space between li items */}
        <li
          onClick={() => navigate("content-listing-page")}
          className={`text-white cursor-pointer ${(pathMatchRoute("/content-listing-page")) ? "hidden": ""}`}
        >
          Explore Clinics & Shelters
        </li>
        <li
          onClick={() => navigate("/options")}
          className={`text-white cursor-pointer
          ${((pathMatchRoute("/options")))? "hidden": ""}
          `}
        >
          Login
        </li>
        <li
          className={`bg-white px-4 py-2 rounded cursor-pointer 
            ${(pathMatchRoute("/login")) ? "hidden": ""} 
             `}
          onClick={() => navigate("/login")}
        >
          Get Started
        </li>
      </ul>
    </div>
  </header>
  
  );
}

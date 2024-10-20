import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Assuming you're using react-router for navigation

export default function HeaderGuest() {

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
    <header className="flex justify-between items-center p-4 bg-yellow-900 shadow-sm sticky top-0 z-40">
    <img
      onClick={() => navigate("/")}
      src="/images/innopetcare-white.png"
      alt="Innopetcare logo"
      className="h-8 cursor-pointer"
    />
    <div className="hidden md:block">
      <ul className="flex space-x-4 items-center"> {/* Add flex here to ul and space between li items */}
      </ul>
    </div>
  </header>
  
  );
}

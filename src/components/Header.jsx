import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import innoPetCareLogo from "../assets/png/innopetcare-white.png";
import { CiBellOn, CiSettings } from "react-icons/ci";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";

export default function Header() {
  const [pageState, setPageState] = useState("Sign in");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState("Profile");
      } else {
        setPageState("Sign in");
      }
    });
  });

  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true;
    }
  }

  return (
    <header className="flex justify-between items-center p-4 bg-yellow-500 shadow-sm sticky top-0 z-40">
      {/* Logo Section */}
      <img
        onClick={() => navigate("/")}
        src={innoPetCareLogo}
        alt="Innopetcare logo"
        className="h-8 cursor-pointer"
      />

      {/* Navbar Section */}
      <div className="hidden md:flex items-center space-x-6">
        <ul className="flex space-x-6 items-center">
          <li
            onClick={() => navigate("/notifications")}
            className="text-white text-3xl cursor-pointer"
          >
            <CiBellOn />
          </li>
          <li
            onClick={() => navigate("/settings")}
            className="text-white text-3xl cursor-pointer"
          >
            <CiSettings />
          </li>
          <li
            onClick={() => navigate("/help")}
            className="text-white text-3xl cursor-pointer"
          >
            <IoIosHelpCircleOutline />
          </li>
        </ul>

        {/* Profile Section */}
        <div className="relative">
          <FaUserCircle className="text-white text-3xl cursor-pointer"/>

          <ul
            role="menu"
            data-popover="profile-menu"
            data-popover-placement="bottom"
            className="absolute right-0 z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none"
          >

            <li className="flex flex-col rounded-md p-2">
              <p>Moreen</p>
              <p>moreen@gmail.com</p>
            </li>
            <hr className="my-2 border-slate-200" role="menuitem" />

            <li
              role="menuitem"
              className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
              onClick={() => navigate("/profile")}

            >
              <p className="text-slate-800 font-medium ml-2">Edit Profile</p>
            </li>
            <li
              role="menuitem"
              className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
              onClick={() => navigate("/help")}

            >
              <p className="text-slate-800 font-medium ml-2">Help</p>
            </li>
            <li
              role="menuitem"
              className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
              onClick={() => navigate("/settings")}

            >
              <p className="text-slate-800 font-medium ml-2">Settings</p>
            </li>
            <hr className="my-2 border-slate-200" role="menuitem" />
            <li
              role="menuitem"
              className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
            >
              <p className="text-slate-800 font-medium ml-2">Sign Out</p>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { db } from "../firebase"; // import Firebase configuration
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // Firestore functions
import adoptPet from "../assets/png/adopt pet.png";
import { IoIosHelpCircleOutline, IoIosNotificationsOutline } from "react-icons/io";

export default function HeaderDynamic() {

  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  var slug;

 

  // Check if there's a part after "sites/"
  if (parts.length > 1) {
    slug = parts[1].split("/")[0]; // Get only the first part after "/"
   } 


  const [headerData, setHeaderData] = useState({
    headerColor: "",
    headerTextColor: "",
    image: "",
    name: "",
  });
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Function to fetch global section data by slug
    const fetchHeaderData = async () => {
      try {
        // Reference the 'global-sections' collection and query by slug
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0].data();
          setHeaderData({
            headerColor: doc.headerColor,
            headerTextColor: doc.headerTextColor,
            image: doc.image,
            name: doc.name,
          });
        } else {
          console.log("No matching documents.");
        }
      } catch (error) {
        console.error("Error fetching header data: ", error);
      }
    };

    fetchHeaderData();
  }, [slug]); // Runs whenever the slug changes

  return (
    <>
      {/* Nav Bar */}
      <nav
        className="flex items-center justify-between py-4 sticky px-5"
        style={{
          background: headerData.headerColor, // Use headerColor here
          color: headerData.headerTextColor, // Use headerTextColor here
        }}
      >
        {/* Logo */}

        <div className="flex items-center space-x-6">
          {/* Logo Picture Here */}
          <Link to={`sites/${slug}/`}><img src={headerData.image} alt="Logo" className="h-8" /></Link>
          <p>{headerData.name}</p> {/* Dynamic name from Firebase */}
        </div>
        {/* Combined Flex Container */}
        <div className="flex items-center space-x-6">
          {/* Navigation Links */}
          <ul className="flex items-center space-x-6">
            <Link to={`sites/${slug}/about`}>About Us</Link>
            <Link to={`sites/${slug}/services`}>Services</Link>
            <Link to={`sites/${slug}/appointments`}>Appointments</Link>
            <Link to={`sites/${slug}/contact`}>Contact Us</Link>
            <Link to={`sites/${slug}/adopt-pet`}>Adopt Pets</Link>
            <Link to={`sites/${slug}/messages`}>
            <FiMessageCircle size={24}  />
            </Link>
            <Link to={`sites/${slug}/notifications`}>
            <IoIosNotificationsOutline
            size={24} />
            </Link>
            <Link to={`sites/${slug}/help`}>
            <IoIosHelpCircleOutline
            size={24} />
            </Link>
            <Link>
            <img src={adoptPet} alt="" srcset="" className="h-9" />
            </Link>
          </ul>

          {/* Profile Section */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <FaUserCircle
              className="text-3xl cursor-pointer"
              fill={headerData.headerTextColor} // Use headerTextColor here
            />

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <ul
                role="menu"
                data-popover="profile-menu"
                data-popover-placement="bottom"
                className={`absolute right-0 z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none transition-all duration-300 ease-in-out transform`}
              >
                <li className="flex flex-col rounded-md p-2 text-black">
                  Example Name example@gmail.com
                </li>
                <hr className="my-2 border-slate-200" role="menuitem" />
                <li
                  role="menuitem"
                  className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                >
                  <Link to={`/sites/${slug}/dashboard`} className="text-slate-800 font-medium ml-2">Dashboard</Link>
                </li>
                <li
                  role="menuitem"
                  className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                >
                  <p className="text-slate-800 font-medium ml-2">
                    Edit Profile
                  </p>
                </li>
                <li
                  role="menuitem"
                  className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                >
                  <p className="text-slate-800 font-medium ml-2">
                    Notifications
                  </p>
                </li>
                <li
                  role="menuitem"
                  className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                >
                  <Link to={`/sites/${slug}/help`} className="text-slate-800 font-medium ml-2">Help</Link>
                </li>
                <li
                  role="menuitem"
                  className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
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
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

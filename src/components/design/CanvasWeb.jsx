import { FaUserCircle } from "react-icons/fa";
import InnoPetCareSmall from "../../assets/png/InnoPetCareSmall.png";
import { useState } from "react";

const CanvasWeb = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <div className="mockup-browser border-base-300 border h-[80vh]">
        <div className="mockup-browser-toolbar">
          <div className="input border-base-300 border">
            https://innopetcare.com/
          </div>
        </div>

        {/* Nav Bar */}
        <nav className="flex items-center justify-between bg-blue-500 py-4 sticky text-sm px-5">
          {/* Logo */}

          <div className="flex items-center space-x-6">
            <img src={InnoPetCareSmall} alt="Logo" className="h-8" />
            <p>Fort Deo</p>
          </div>
          {/* Combined Flex Container */}
          <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            <ul className="flex items-center space-x-6">
              <li>About Us</li>
              <li>Services</li>
              <li>Appointments</li>
              <li>Contact Us</li>
            </ul>

            {/* Profile Section */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <FaUserCircle className="text-white text-3xl cursor-pointer" />

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <ul
                  role="menu"
                  data-popover="profile-menu"
                  data-popover-placement="bottom"
                  className={`absolute right-0 z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none transition-all duration-300 ease-in-out transform`}
                >
                  <li className="flex flex-col rounded-md p-2">
                    Example Name example@gmail.com
                  </li>
                  <hr className="my-2 border-slate-200" role="menuitem" />
                  <li
                    role="menuitem"
                    className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                  >
                    <p className="text-slate-800 font-medium ml-2">Dashboard</p>
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
                    <p className="text-slate-800 font-medium ml-2">Help</p>
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
      </div>
    </>
  );
};

export default CanvasWeb;

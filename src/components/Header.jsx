import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import innoPetCareLogo from "../assets/png/innopetcare-white.png";
import innoPetCareLogoSmallScreen from "../assets/png/InnoPetCareSmall.png";
import { CiBellOn } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import { db } from "../firebase";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function Header() {
  const [pageState, setPageState] = useState("Sign in");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    photoURL: "",
    uid: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedUserName, setFetchedUserName] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [logo, setLogo] = useState(
    window.innerWidth < 640 ? innoPetCareLogoSmallScreen : innoPetCareLogo
  );

  useEffect(() => {
    const handleResize = () => {
      setLogo(
        window.innerWidth < 640 ? innoPetCareLogoSmallScreen : innoPetCareLogo
      );
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onLogout = () => {
    setIsLoading(true);
    auth
      .signOut()
      .then(() => {
        toast.success("Signed out successfully");
        navigate("/");
      })
      .catch(() => {
        toast.error("Failed to sign out");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setPageState("Profile");

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userDataFromDB = docSnap.data();
          await updateDoc(docRef, { lastActivityTime: serverTimestamp() });

          setUserData({
            name: userDataFromDB.name || user.displayName,
            email: userDataFromDB.email || user.email,
            photoURL: user.photoURL || "",
            uid: user.uid,
          });
          setFetchedUserName(userDataFromDB.name || user.displayName);
        } else {
          setUserData({
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL || "",
            uid: user.uid,
          });
          setFetchedUserName(user.displayName);
        }
      } else {
        setPageState("Sign in");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <header className="flex justify-between items-center p-4 bg-yellow-500 shadow-sm sticky top-0 z-40 print:hidden">
          {/* Logo for different screen sizes */}
          <img
            onClick={() => navigate("/")}
            src={
              location.pathname === "/admin" ? innoPetCareLogoSmallScreen : logo
            }
            alt="Innopetcare logo"
            className="h-8 cursor-pointer"
          />

          {/* Notification Icon - always visible */}
          <div className="flex items-center space-x-4">
            <CiBellOn
              onClick={() => navigate("/notifications")}
              className="text-white text-3xl cursor-pointer"
            />

            {/* User Icon for small screens - Opens fullscreen menu */}
            <div className="md:hidden">
              <FaUserCircle
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white text-3xl cursor-pointer"
              />
            </div>

            {/* User Icon for larger screens */}
            <div className="hidden md:flex items-center">
              <div
                className="relative"
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                {userData.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="User Profile"
                    className="h-8 w-8 rounded-full cursor-pointer"
                    onMouseEnter={() => setIsMenuOpen(true)}
                  />
                ) : (
                  <FaUserCircle
                    className="text-white text-3xl cursor-pointer"
                    onMouseEnter={() => setIsMenuOpen(true)}
                  />
                )}

                {/* Dropdown menu for larger screens */}
                <ul
                  role="menu"
                  className={`absolute right-0 z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg transform ${
                    isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  style={{ display: isMenuOpen ? "block" : "none" }}
                >
                  <li className="flex flex-col rounded-md p-2">
                    <p>{fetchedUserName || "User"}</p>
                    <p>{userData.email}</p>
                  </li>
                  <hr className="my-2 border-slate-200" />
                  <li
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                  >
                    <p className="text-slate-800 font-medium ml-2">
                      My Account
                    </p>
                  </li>
                  <li
                    onClick={() => navigate("/help")}
                    className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                  >
                    <p className="text-slate-800 font-medium ml-2">Help</p>
                  </li>
                  <li
                    onClick={() => navigate("/settings")}
                    className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                  >
                    <p className="text-slate-800 font-medium ml-2">Settings</p>
                  </li>
                  <li
                    onClick={() => navigate("/contact")}
                    className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                  >
                    <p className="text-slate-800 font-medium ml-2">
                      Contact us
                    </p>
                  </li>
                  <li
                    onClick={() => navigate("/privacy-policy")}
                    className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                  >
                    <p className="text-slate-800 font-medium ml-2">
                      Privacy Policy
                    </p>
                  </li>
                  <li
                    onClick={() => navigate("/terms-and-conditions")}
                    className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100"
                  >
                    <p className="text-slate-800 font-medium ml-2">
                      Terms and Conditions
                    </p>
                  </li>
                  <hr className="my-2 border-slate-200" />
                  <li
                    onClick={onLogout}
                    className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100 text-red-500 font-medium"
                  >
                    <LuLogOut className="mr-2" /> Sign Out
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fullscreen swipe menu for small screens */}
          <div
            className={`fixed inset-0 bg-yellow-600 z-50 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-end p-4">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white text-2xl font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="flex-grow p-4 space-y-4">
                <p className="pl-2 font-semibold text-white text-lg">
                  {fetchedUserName || "User"}
                </p>
                <p className="pl-2 text-gray-100">{userData.email}</p>
                <hr className="my-2 border-white" />

                {/* Menu Buttons */}
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 text-white hover:bg-yellow-700 rounded-lg"
                >
                  My Account
                </button>
                <button
                  onClick={() => {
                    navigate("/help");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 text-white hover:bg-yellow-700 rounded-lg"
                >
                  Help
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 text-white hover:bg-yellow-700 rounded-lg"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    navigate("/contact");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 text-white hover:bg-yellow-700 rounded-lg"
                >
                  Contact Us
                </button>
                <button
                  onClick={() => {
                    navigate("/privacy-policy");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 text-white hover:bg-yellow-700 rounded-lg"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => {
                    navigate("/terms-and-conditions");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 text-white hover:bg-yellow-700 rounded-lg"
                >
                  Terms and Conditions
                </button>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors duration-200 ease-in-out flex items-center justify-center"
                >
                  <LuLogOut className="mr-2" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
}

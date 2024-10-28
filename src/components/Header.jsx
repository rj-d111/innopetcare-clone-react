import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import innoPetCareLogo from "../assets/png/innopetcare-white.png";
import { CiBellOn, CiSettings } from "react-icons/ci";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "./Spinner";

export default function Header() {
  const [pageState, setPageState] = useState("Sign in");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    photoURL: "",
    uid: "", // Add uid to the state
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedUserName, setFetchedUserName] = useState(""); // New state for fetched username

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  function onLogout() {
    setIsLoading(true);
    auth.signOut()
      .then(() => {
        toast.success("Signed out successfully");
        navigate("/");
      })
      .catch((error) => {
        toast.error("Failed to sign out");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);

      if (user) {
        setPageState("Profile");

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userDataFromDB = docSnap.data();
          setUserData({
            name: userDataFromDB.name || user.displayName,
            email: userDataFromDB.email || user.email,
            photoURL: user.photoURL || "",
            uid: user.uid // Set uid in the state
          });
          setFetchedUserName(userDataFromDB.name || user.displayName); // Set the fetched username directly
        } else {
          setUserData({
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL || "",
            uid: user.uid // Set uid in the state
          });
          setFetchedUserName(user.displayName); // Fallback name if document doesn't exist
        }
      } else {
        setPageState("Sign in");
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  // Removed fetchUserNameFromFirestore as it's no longer needed here

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <header className="flex justify-between items-center p-4 bg-yellow-500 shadow-sm sticky top-0 z-40">
          <img
            onClick={() => navigate("/")}
            src={innoPetCareLogo}
            alt="Innopetcare logo"
            className="h-8 cursor-pointer"
          />
          <div className="hidden md:flex items-center space-x-6">
            <ul className="flex space-x-6 items-center">
              <li onClick={() => navigate("/notifications")} className="text-white text-3xl cursor-pointer">
                <CiBellOn />
              </li>
              {/* <li onClick={() => navigate("/settings")} className="text-white text-3xl cursor-pointer">
                <CiSettings />
              </li>
              <li onClick={() => navigate("/help")} className="text-white text-3xl cursor-pointer">
                <IoIosHelpCircleOutline />
              </li> */}
            </ul>

            <div className="relative" onMouseLeave={() => setIsMenuOpen(false)}>
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

              <ul
                role="menu"
                data-popover="profile-menu"
                data-popover-placement="bottom"
                className={`absolute right-0 z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg focus:outline-none transition-all duration-300 ease-in-out transform ${
                  isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{ display: isMenuOpen ? "block" : "none" }}
              >
                <li className="flex flex-col rounded-md p-2">
                  <p>{fetchedUserName || "User"}</p> {/* Use the state to render username */}
                  <p>{userData.email}</p>
                </li>
                <hr className="my-2 border-slate-200" role="menuitem" />
                <li role="menuitem" className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100" onClick={() => navigate("/profile")}>
                  <p className="text-slate-800 font-medium ml-2">User Profile</p>
                </li>
                {/* <li role="menuitem" className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100" onClick={() => navigate("/user-feedback")}>
                  <p className="text-slate-800 font-medium ml-2">User Feedback</p>
                </li>
                <li role="menuitem" className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100" onClick={() => navigate("/help")}>
                  <p className="text-slate-800 font-medium ml-2">Help</p>
                </li> */}
                <li role="menuitem" className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100" onClick={() => navigate("/settings")}>
                  <p className="text-slate-800 font-medium ml-2">Settings</p>
                </li>
                <hr className="my-2 border-slate-200" role="menuitem" />
                <li role="menuitem" className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100" onClick={onLogout}>
                  <p className="text-slate-800 font-medium ml-2" >
                    Sign Out
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </header>
      )}
    </>
  );
}

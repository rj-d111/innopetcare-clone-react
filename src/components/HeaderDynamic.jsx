import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { LuLogOut } from "react-icons/lu";
import { RxHamburgerMenu } from "react-icons/rx";
import { db } from "../firebase";
import { toast } from "react-toastify";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import adoptPet from "../assets/png/adopt_pet.png";
import AnimalShelterSitesModal from "./AnimalShelterSitesModal";

export default function HeaderDynamic() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const pathname = window.location.href.split("#")[0];
  const parts = pathname.split("sites/");
  let slug = parts.length > 1 ? parts[1].split("/")[0] : "";

  const [headerData, setHeaderData] = useState({
    headerColor: "#b7791f",
    headerTextColor: "#fff",
    image: "",
    name: "",
  });
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
  });
  const [projectType, setProjectType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);

  const isActiveLink = (path) => window.location.pathname.includes(path);
  // const isActiveLink = (path) => console.log(location.pathname === path);

  
  function onLogout() {
    auth
      .signOut()
      .then(() => {
        toast.success("Signed out successfully");
        navigate("/");
      })
      .catch((error) => {
        toast.error("Failed to sign out");
      });
  }

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
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
        }
      } catch (error) {
        console.error("Error fetching header data: ", error);
      }
    };
    fetchHeaderData();
  }, [slug]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const globalSectionQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );

        const globalSectionSnapshot = await getDocs(globalSectionQuery);

        // Check if the snapshot is not empty
        if (!globalSectionSnapshot.empty) {
          // Get the projectId directly from doc.id
          const projectDocId = globalSectionSnapshot.docs[0].id;

          // Fetch the project document using the projectDocId
          const projectDoc = await getDoc(doc(db, "projects", projectDocId));

          // If the project document exists, set the project type
          if (projectDoc.exists()) {
            setProjectType(projectDoc.data().type);
          }
        }
      } catch (error) {
        console.error("Error fetching project data: ", error);
      }
    };

    fetchProjectData();
  }, [slug]);

  useEffect(() => {
    const fetchClientData = async () => {
      if (user) {
        try {
          // Fetch client data from Firestore using the current user's UID
          const clientDocRef = doc(db, "clients", user.uid);
          const clientDoc = await getDoc(clientDocRef);
  
          if (clientDoc.exists()) {
            const clientData = clientDoc.data();
  
            // Fetch the project ID of the current veterinary site
            const globalSectionQuery = query(
              collection(db, "global-sections"),
              where("slug", "==", slug)
            );
            const globalSectionSnapshot = await getDocs(globalSectionQuery);
  
            if (!globalSectionSnapshot.empty) {
              const projectId = globalSectionSnapshot.docs[0].id;
  
              // Check if the client's projectId matches the current site's projectId
              if (clientData.projectId === projectId) {
                // If projectId matches, set client data
                setClientData({
                  name: clientData.name,
                  email: clientData.email,
                });
              } else {
                // If projectId does not match, clear client data
                setClientData({
                  name: "",
                  email: "",
                });
              }
            }
          }
        } catch (error) {
          console.error("Error fetching client data: ", error);
        }
      }
    };
  
    fetchClientData();
  }, [user, slug]);
  

  return (
    <>
      {/* Main Header Navigation */}
      <nav
        className="flex items-center justify-between py-4 sticky top-0 px-5 z-50"
        style={{
          background: headerData.headerColor,
          color: headerData.headerTextColor,
        }}
      >
        <div className="flex items-center lg:space-x-6">
          {headerData.image && (
            <>
              <Link to={`sites/${slug}/`}>
                <img src={headerData.image} alt="Logo" className="h-8" />
              </Link>
              <p>{headerData.name}</p>
            </>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {/* Links for large screens */}
          <ul className="hidden lg:flex items-center space-x-6">
            <Link
              to={`sites/${slug}/about`}
              className="transition-colors duration-200 px-3 py-2 rounded-md"
              style={{
                backgroundColor: isActiveLink(`/sites/${slug}/about`)
                  ? headerData.headerTextColor
                  : "transparent",
                color: isActiveLink(`/sites/${slug}/about`)
                  ? headerData.headerColor
                  : headerData.headerTextColor,
              }}
            >
              About Us
            </Link>
            {projectType !== "Animal Shelter Site" && (
              <Link
                to={`/sites/${slug}/services`}
                className="transition-colors duration-200 px-3 py-2 rounded-md"
                style={{
                  backgroundColor: isActiveLink(`/sites/${slug}/services`)
                    ? headerData.headerTextColor
                    : "transparent",
                  color: isActiveLink(`/sites/${slug}/services`)
                    ? headerData.headerColor
                    : headerData.headerTextColor,
                }}
              >
                Services
              </Link>
            )}
            {projectType === "Animal Shelter Site" && (
              <>
                <Link
                  to={`sites/${slug}/volunteer`}
                  className="transition-colors duration-200 px-3 py-2 rounded-md"
                  style={{
                    backgroundColor: isActiveLink(`/sites/${slug}/volunteer`)
                      ? headerData.headerTextColor
                      : "transparent",
                    color: isActiveLink(`/sites/${slug}/volunteer`)
                      ? headerData.headerColor
                      : headerData.headerTextColor,
                  }}
                >
                  Volunteer
                </Link>
                <Link
                  to={`sites/${slug}/donate`}
                  className="transition-colors duration-200 px-3 py-2 rounded-md"
                  style={{
                    backgroundColor: isActiveLink(`sites/${slug}/donate`)
                      ? headerData.headerTextColor
                      : "transparent",
                    color: isActiveLink(`sites/${slug}/donate`)
                      ? headerData.headerColor
                      : headerData.headerTextColor,
                  }}
                >
                  Donate
                </Link>
              </>
            )}
            <Link
              to={`/sites/${slug}/appointments`}
              className="transition-colors duration-200 px-3 py-2 rounded-md"
              style={{
                backgroundColor: isActiveLink(`/sites/${slug}/appointments`)
                  ? headerData.headerTextColor
                  : "transparent",
                color: isActiveLink(`/sites/${slug}/appointments`)
                  ? headerData.headerColor
                  : headerData.headerTextColor,
              }}
            >
              Appointments
            </Link>
            <Link
              to={`/sites/${slug}/contact`}
              className="transition-colors duration-200 px-3 py-2 rounded-md"
              style={{
                backgroundColor: isActiveLink(`/sites/${slug}/contact`)
                  ? headerData.headerTextColor
                  : "transparent",
                color: isActiveLink(`/sites/${slug}/contact`)
                  ? headerData.headerColor
                  : headerData.headerTextColor,
              }}
            >
              Contact Us
            </Link>
            <Link
              to={`/sites/${slug}/adopt-pet`}
              className="transition-colors duration-200 px-3 py-2 rounded-md"
              style={{
                backgroundColor: isActiveLink(`/sites/${slug}/adopt-pet`)
                  ? headerData.headerTextColor
                  : "transparent",
                color: isActiveLink(`/sites/${slug}/adopt-pet`)
                  ? headerData.headerColor
                  : headerData.headerTextColor,
              }}
            >
              Adopt Pets
            </Link>
          </ul>

          {/* Notifications, Messages, and User Icon for all screen sizes */}
          <Link to={`/sites/${slug}/messages`}>
            <FiMessageCircle
              size={24}
              style={{ color: headerData.headerTextColor }}
            />
          </Link>
          <Link to={`sites/${slug}/notifications`}>
            <IoIosNotificationsOutline
              size={24}
              style={{ color: headerData.headerTextColor }}
            />
          </Link>
          {/* Conditionally render the adoptPet image if it's not an Animal Shelter Site */}
          {projectType !== "Animal Shelter Site" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer"
            >
              <img src={adoptPet} alt="Adopt Pet" className="h-9" />
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden"
          >
            {clientData.name ? (
              <FaUserCircle
                size={24}
                style={{ color: headerData.headerTextColor }}
              />
            ) : (
              <RxHamburgerMenu
                size={24}
                style={{ color: headerData.headerTextColor }}
              />
            )}
          </button>
          <div
            className="relative hidden lg:block"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            {clientData.name ? (
              <div>
                <button>
                  <FaUserCircle
                    size={24}
                    style={{ color: headerData.headerTextColor }}
                    className="hidden lg:block"
                  />
                </button>

                {isDropdownOpen && (
                  <ul
                    role="menu"
                    className="absolute right-0 z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg text-black"
                  >
                    <li className="flex flex-col rounded-md p-2 text-black">
                      {clientData.name}
                      <br />
                      {clientData.email}
                    </li>
                    <hr className="my-2 border-slate-200" role="menuitem" />
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link to={`/sites/${slug}/dashboard`} className="ml-2">
                        Dashboard
                      </Link>
                    </li>
                    {projectType !== "Animal Shelter Site" && (
                      <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                        <Link
                          to={`/sites/${slug}/dashboard/pets`}
                          className="ml-2"
                        >
                          Pet Health Records
                        </Link>
                      </li>
                    )}
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link to={`/sites/${slug}/profile`} className="ml-2">
                        My Account
                      </Link>
                    </li>
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link to={`/sites/${slug}/help`} className="ml-2">
                        Help Menu
                      </Link>
                    </li>
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link to={`/sites/${slug}/settings`} className="ml-2">
                        Settings
                      </Link>
                    </li>
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link
                        to={`/sites/${slug}/privacy-policy`}
                        className="ml-2"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link
                        to={`/sites/${slug}/terms-and-conditions`}
                        className="ml-2"
                      >
                        Terms and Conditions
                      </Link>
                    </li>
                    <hr className="my-2 border-slate-200" />
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <p className="ml-2" onClick={onLogout}>
                        Sign Out
                      </p>
                    </li>
                  </ul>
                )}
              </div>
            ) : (
              <Link
                to={`/sites/${slug}/dashboard`}
                className="text-white px-4 py-2 rounded-lg hidden lg:block"
                style={{
                  backgroundColor: headerData.headerTextColor,
                  color: headerData.headerColor,
                }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Fullscreen swipe menu for small screens */}
      <div
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: headerData.headerColor }}
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
          <div className="overflow-auto">
            <div className="flex-grow p-4 space-y-4">
              <p className="pl-2 font-semibold text-white text-lg">
                {clientData.name || headerData.name}
              </p>
              {clientData.name ? (
                <p className="pl-2 text-gray-100">{clientData.email}</p>
              ) : (
                <p className="mt-4">
                  <Link
                    to={`/sites/${slug}/dashboard`}
                    className="text-white px-4 py-2 rounded-lg lg:block"
                    style={{
                      backgroundColor: headerData.headerTextColor || "#000", // Fallback color
                      color: headerData.headerColor || "#fff", // Fallback color
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </p>
              )}

              <hr className="my-2 border-white" />
              {/* About Us Accordion */}
              <button
                onClick={() => setIsAboutUsOpen(!isAboutUsOpen)}
                className="w-full text-left p-2 text-white hover:bg-opacity-70 rounded-lg"
              >
                About Us {isAboutUsOpen ? "▼" : "▲"}
              </button>
              {isAboutUsOpen && (
                <div className="pl-4 space-y-2">
                  <Link
                    to={`sites/${slug}/about`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block transition-colors duration-200 px-3 py-2 rounded-md"
                    style={{ color: headerData.headerTextColor }}
                  >
                    About Us
                  </Link>
                  {projectType !== "Animal Shelter Site" && (
                    <Link
                      to={`sites/${slug}/services`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block transition-colors duration-200 px-3 py-2 rounded-md"
                      style={{ color: headerData.headerTextColor }}
                    >
                      Services
                    </Link>
                  )}
                  {projectType === "Animal Shelter Site" && (
                    <>
                      <Link
                        to={`/sites/${slug}/volunteer`}
                        className="block transition-colors duration-200 px-3 py-2 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          backgroundColor: isActiveLink(
                            `/sites/${slug}/volunteer`
                          )
                            ? headerData.headerTextColor
                            : "transparent",
                          color: isActiveLink(`/sites/${slug}/volunteer`)
                            ? headerData.headerColor
                            : headerData.headerTextColor,
                        }}
                      >
                        Volunteer
                      </Link>

                      <Link
                        to={`/sites/${slug}/donate`}
                        className="block transition-colors duration-200 px-3 py-2 rounded-md"
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          backgroundColor: isActiveLink(`/sites/${slug}/donate`)
                            ? headerData.headerTextColor
                            : "transparent",
                          color: isActiveLink(`/sites/${slug}/donate`)
                            ? headerData.headerColor
                            : headerData.headerTextColor,
                        }}
                      >
                        Donate
                      </Link>
                    </>
                  )}

                  <Link
                    to={`sites/${slug}/appointments`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block transition-colors duration-200 px-3 py-2 rounded-md"
                    style={{ color: headerData.headerTextColor }}
                  >
                    Appointments
                  </Link>
                  <Link
                    to={`sites/${slug}/contact`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block transition-colors duration-200 px-3 py-2 rounded-md"
                    style={{ color: headerData.headerTextColor }}
                  >
                    Contact Us
                  </Link>
                  <Link
                    to={`sites/${slug}/adopt-pet`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block transition-colors duration-200 px-3 py-2 rounded-md"
                    style={{ color: headerData.headerTextColor }}
                  >
                    Adopt Pets
                  </Link>
                </div>
              )}
              {/* Additional Menu Options */}
              <button
                onClick={() => {
                  navigate(`/sites/${slug}/dashboard`);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 text-white hover:bg-opacity-70 rounded-lg"
              >
                Dashboard
              </button>
              {projectType !== "Animal Shelter Site" && (
                <button
                  onClick={() => {
                    navigate(`/sites/${slug}/dashboard/pets`);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 text-white hover:bg-opacity-70 rounded-lg"
                >
                  Pet Health Records
                </button>
              )}

              <button
                onClick={() => {
                  navigate(`/sites/${slug}/profile`);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 text-white hover:bg-opacity-70 rounded-lg"
              >
                My Account
              </button>
              <button
                onClick={() => {
                  navigate(`/sites/${slug}/help`);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 text-white hover:bg-opacity-70 rounded-lg"
              >
                Help Menu
              </button>
              <button
                onClick={() => {
                  navigate(`/sites/${slug}/settings`);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 text-white hover:bg-opacity-70 rounded-lg"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  navigate(`/sites/${slug}/privacy-policy`);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 text-white hover:bg-opacity-70 rounded-lg"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => {
                  navigate(`/sites/${slug}/terms-and-conditions`);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 text-white hover:bg-opacity-70 rounded-lg"
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
      </div>

      {/* Render the Animal Shelter Sites Modal */}
      <AnimalShelterSitesModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        headerColor={headerData.headerColor}
      />
    </>
  );
}

import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import adoptPet from "../assets/png/adopt_pet.png";
import {
  IoIosHelpCircleOutline,
  IoIosNotificationsOutline,
} from "react-icons/io";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import AnimalShelterSitesModal from "./AnimalShelterSitesModal"; // Import the modal component

export default function HeaderDynamic() {
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  var slug;

  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  if (parts.length > 1) {
    slug = parts[1].split("/")[0];
  }

  const [headerData, setHeaderData] = useState({
    headerColor: "",
    headerTextColor: "",
    image: "",
    name: "",
  });
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
  });
  const [projectType, setProjectType] = useState(""); // For storing the project type
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

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
        } else {
          console.log("No matching documents.");
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

        if (!globalSectionSnapshot.empty) {
          const globalSectionData = globalSectionSnapshot.docs[0].data();
          const projectId = globalSectionData.projectId;

          const projectDoc = await getDoc(doc(db, "projects", projectId));

          if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            setProjectType(projectData.type);
          } else {
            console.log("No project found with this projectId.");
          }
        } else {
          console.log("No matching global section found.");
        }
      } catch (error) {
        console.error("Error fetching project data: ", error);
      }
    };

    fetchProjectData();
  }, [slug]);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setClientData({
          name: user.displayName,
          email: user.email,
        });
      }
    });
  }, [auth]);

  return (
    <>
      <nav
        className="flex items-center justify-between py-4 sticky px-5"
        style={{
          background: headerData.headerColor,
          color: headerData.headerTextColor,
        }}
      >
        <div className="flex items-center space-x-6">
          <Link to={`sites/${slug}/`}>
            <img src={headerData.image} alt="Logo" className="h-8" />
          </Link>
          <p>{headerData.name}</p>
        </div>

        <div className="flex items-center space-x-6">
          <ul className="flex items-center space-x-6">
            <Link to={`sites/${slug}/about`}>About Us</Link>
            {projectType !== "Animal Shelter Site" && (
              <>
              <Link to={`sites/${slug}/services`}>Services</Link>
              </>
            )}
            {projectType === "Animal Shelter Site" && (
              <>
                <Link to={`sites/${slug}/volunteer`}>Volunteer</Link>
                <Link to={`sites/${slug}/donate`}>Donate</Link>
              </>
            )}
            <Link to={`sites/${slug}/appointments`}>Appointments</Link>
            <Link to={`sites/${slug}/contact`}>Contact Us</Link>
            <Link to={`sites/${slug}/adopt-pet`}>Adopt Pets</Link>
            <Link to={`sites/${slug}/messages`}>
              <FiMessageCircle size={24} />
            </Link>
            <Link to={`sites/${slug}/notifications`}>
              <IoIosNotificationsOutline size={24} />
            </Link>
            <Link to={`sites/${slug}/help`}>
              <IoIosHelpCircleOutline size={24} />
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
          </ul>

          <div className="relative">
            {clientData.name ? (
              <div
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <FaUserCircle
                  className="text-3xl cursor-pointer"
                  fill={headerData.headerTextColor}
                />
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
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link to={`/sites/${slug}/profile`} className="ml-2">
                        User Profile
                      </Link>
                    </li>
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link to={`/sites/${slug}/feedback`} className="ml-2">
                        User Feedback
                      </Link>
                    </li>
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link
                        to={`/sites/${slug}/notifications`}
                        className="ml-2"
                      >
                        Notifications
                      </Link>
                    </li>
                    <li className="cursor-pointer flex items-center rounded-md p-2 hover:bg-slate-100">
                      <Link to={`/sites/${slug}/help`} className="ml-2">
                        Help
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
                      <Link to={`/sites/${slug}/profile`} className="ml-2">
                        Settings
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
                to={`/sites/${slug}/appointments`}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Render the Animal Shelter Sites Modal */}
      <AnimalShelterSitesModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      />
    </>
  );
}

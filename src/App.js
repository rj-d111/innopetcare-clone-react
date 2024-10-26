import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Corrected useNavigate import
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

import Home from "./pages/Home";
import HomeGuest from "./pages/HomeGuest";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import HeaderGuest from "./components/HeaderGuest";
import HeaderDesign from "./components/HeaderDesign";
import HeaderDynamic from "./components/HeaderDynamic";
import Options from "./pages/Options";
import ContentListingPage from "./pages/ContentListingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GuestRoute from "./components/GuestRoute";
import Design from "./pages/Design";
import ProjectDashboard from "./components/projects/ProjectDashboard";
import ForApproval from "./pages/ForApproval";
import TechAdminHome from "./pages/TechAdminHome";
import ProjectHome from "./components/projects/ProjectHome";
import ProjectAbout from "./components/projects/ProjectAbout";
import ProjectServices from "./components/projects/ProjectServices";
import ProjectAppointments from "./components/projects/ProjectAppointments";
import ProjectContact from "./components/projects/ProjectContact";
import ProjectLogin from "./components/projects/ProjectLogin";
import ProjectRegister from "./components/projects/ProjectRegister";
import ProjectForgotPassword from "./components/projects/ProjectForgotPassword";
import TermsConditions from "./pages/TermsConditions";
import ProjectHelp from "./components/projects/ProjectHelp";
import TechAdminRegister from "./pages/TechAdminRegister";
import ProjectMessages from "./components/projects/ProjectMessages";
import ProjectNotifications from "./components/projects/ProjectNotifications";
import ProjectAdoption from "./components/projects/ProjectAdoption";
import OwnerHome from "./pages/OwnerHome";

// For Owner Pages
import OwnerSchedule from "../src/components/owners/OnwerSchedule";
import OwnerAdoptions from "../src/components/owners/OwnerAdoption";
import OwnerMessages from "../src/components/owners/OwnerMessages";
import OwnerPetHealthRecords from "../src/components/owners/OwnerPetHealthRecords";
import OwnerPetOwners from "../src/components/owners/OwnerPetOwners";
import OwnerDashboard from "../src/components/owners/OwnerDashboard";
import OwnerPending from "./components/owners/OwnerPending";
import EmailVerification from "./pages/EmailVerification";
import About from "./pages/About";
import ProjectProfile from "./components/projects/ProjectProfile";
import ProjectFeedback from "./components/projects/ProjectFeedback";
import ProjectPrivacyPolicy from "./components/projects/ProjectPrivacyPolicy";
import ProjectVolunteer from "./components/projects/ProjectVolunteer";
import ProjectDonate from "./components/projects/ProjectDonate";
import LandingGuest from "./pages/LandingGuest";
import OwnerAnimalSchedule from "./components/owners/OwnerAnimalSchedule";
import ProjectAdoptionInfo from "./components/projects/ProjectAdoptionInfo";
import UserProfile from "./pages/UserProfile";
import UserFeedback from "./pages/UserFeedback";
import Help from "./pages/Help";
import UserApproval from "./pages/UserApproval";
import TechAdminUsers from "./components/tech-admin/TechAdminUsers";
import TechAdminProjects from "./components/tech-admin/TechAdminProjects";
import TechAdminDashboard from "./components/tech-admin/TechAdminDashboard";
import TechAdminUsersDetails from "./components/tech-admin/TechAdminUsersDetails";
import TechAdminFeedback from "./components/tech-admin/TechAdminFeedback";
import UserSettings from "./pages/UserSettings";
import Notifications from "./pages/Notifications";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isApproved, setIsApproved] = useState(null); // Add isApproved state
  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isWebVersion, setWebVersion] = useState(true);
  const [isVerified, setIsVerified] = useState(); // Add isVerified state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setIsVerified(user.emailVerified);

        try {
          const userRoles = ["users", "clients", "tech-admin"];
          let foundRole = null;
          let isApprovedStatus = null;

          for (const role of userRoles) {
            // Query the collection where 'uid' field matches authenticated user's uid
            const userQuery = query(
              collection(db, role),
              where("uid", "==", user.uid)
            );

            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
              foundRole = role;

              querySnapshot.forEach((doc) => {
                const userData = doc.data();

                // Fetch the isApproved and email fields for users
                if (role === "users") {
                  isApprovedStatus = userData.isApproved;
                  console.log("User Email:", userData.email);
                  console.log("User UID from users table:", userData.uid);
                }

                // Fetch the isApproved field for clients
                if (role === "clients") {
                  isApprovedStatus = userData.isApproved;
                }
              });

              break; // Break the loop once a matching document is found
            }
          }

          // If no documents were found, fetch attributes using UID
          if (!foundRole) {
            const userRoles = ["users", "clients", "tech-admin"];
            
            // Loop through each role in the userRoles array
            for (const role of userRoles) {
              const uidDocRef = doc(db, role, user.uid); // Create a reference to the specific document
          
              const uidDocSnapshot = await getDoc(uidDocRef); // Use getDoc to fetch the document
          
              if (uidDocSnapshot.exists()) {
                // Check if the document exists
                const userData = uidDocSnapshot.data();
                foundRole = role; // Set foundRole to the current role
                setUserRole(foundRole);
                console.log("User attributes fetched by UID:", userData);
                
                // Assuming userData contains 'isApproved' and 'email' fields
                isApprovedStatus = userData.isApproved;
                console.log("User Email:", userData.email);
                break; // Exit the loop once the role is found
              } else {
                console.log(`No user data found for this UID in ${role}.`);
              }
            }
          }
          
          setUserRole(foundRole);
          setIsApproved(isApprovedStatus); // Set isApproved state based on the role
          console.log(
            foundRole ? `User Role: ${foundRole}` : "User Role: None"
          );
        } catch (error) {
          console.error("Error fetching user role or approval status:", error);
          setUserRole(null);
          setIsApproved(null);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
        setIsApproved(null); // Reset isApproved if not authenticated
      }
    });

    return () => unsubscribe(); // Clean up the subscription
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && userRole) {
      if (userRole === "tech-admin") {
        navigate("/admin");
      } else if (userRole === "clients") {
        navigate(`/sites/${auth.currentUser?.uid}`);
      }
    }
  }, [userRole, location, navigate]);

  const renderHeader = () => {
    if (location.pathname === "/sites/") {
      return <HeaderGuest />;
    }

    if (location.pathname.includes("/sites/")) {
      return <HeaderDynamic />;
    }
    if (location.pathname.startsWith("/design")) {
      return (
        <HeaderDesign
          isWebVersion={isWebVersion}
          setWebVersion={setWebVersion}
        />
      );
    }

    return isApproved ? <Header /> : <HeaderGuest />;
  };

  useEffect(() => {
    // Redirect to email verification if email is not verified
    if (isAuthenticated && !isApproved && userRole === "users") {
      navigate("/approval");
    }
  }, [isAuthenticated, isVerified, navigate]);

  return (
    <>
      {renderHeader()}

      <Routes>
        {/* Other Routes for guests */}
        <Route path="/" element={isAuthenticated ? <Home /> : <HomeGuest />} />
        <Route path="/" element={isVerified ? <Home /> : <HomeGuest />} />
        <Route
          path="/approval"
          element={!isApproved ? <UserApproval /> : <Navigate to="/" />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/landing-guest" element={<LandingGuest />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path="/options"
          element={
            <GuestRoute>
              <Options />
            </GuestRoute>
          }
        />
        <Route path="/sites" element={<ContentListingPage />} />

        {/* Other general routes */}
        <Route element={<PrivateRoute allowedRoles={["users"]} />}>
          {/* Email Verification Route */}
          <Route
            path="/email-verification"
            element={!isVerified ? <EmailVerification /> : <Navigate to="/" />}
          />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/for-approval" element={<UserApproval />} />
          <Route path="/help" element={<Help />} />
          <Route path="/user-feedback" element={<UserFeedback />} />
          <Route
            path="/design/:id"
            element={
              <Design
                isWebVersion={isWebVersion}
                setWebVersion={setWebVersion}
              />
            }
          />
          <Route path="/:id" element={<OwnerHome />}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="schedule" element={<OwnerSchedule />} />
            <Route path="animal-schedule" element={<OwnerAnimalSchedule />} />
            <Route path="pet-records" element={<OwnerPetHealthRecords />} />
            <Route path="pet-owners" element={<OwnerPetOwners />} />
            <Route path="messages" element={<OwnerMessages />} />
            <Route path="adoptions" element={<OwnerAdoptions />} />
            <Route path="pending" element={<OwnerPending />} />
            {/* Other nested routes */}
          </Route>
        </Route>

        {/* Routes for TechAdmin */}
        <Route element={<PrivateRoute allowedRoles={["tech-admin"]} />}>
          <Route path="/admin" element={<TechAdminHome />}>
            <Route path="users" element={<TechAdminUsers />} />
            <Route path="users/:id" element={<TechAdminUsersDetails />} />
            <Route path="dashboard" element={<TechAdminDashboard />} />
            <Route path="projects" element={<TechAdminProjects />} />
            <Route path="feedback" element={<TechAdminFeedback />} />
          </Route>
        </Route>

        {/* Routes for Clients */}
        <Route element={<PrivateRoute allowedRoles={["clients"]} />}>
          <Route path="/sites/:slug/dashboard" element={<ProjectDashboard />} />
          <Route
            path="/sites/:slug/appointments"
            element={
              userRole === "clients" ? (
                isApproved ? (
                  <ProjectAppointments />
                ) : (
                  <ForApproval />
                )
              ) : (
                <ProjectLogin />
              )
            }
          />
          <Route
            path="/sites/:slug/appointments/register"
            element={
              userRole === "clients" ? (
                <ProjectAppointments />
              ) : (
                <ProjectRegister />
              )
            }
          />
          <Route
            path="/sites/:slug/appointments/forgot-password"
            element={
              userRole === "clients" ? (
                <ProjectAppointments />
              ) : (
                <ProjectForgotPassword />
              )
            }
          />
        </Route>
        <Route
          path="/sites/:slug/messages"
          element={
            userRole === "clients" ? <ProjectMessages /> : <ProjectLogin />
          }
        />
        <Route
          path="/sites/:slug/notifications"
          element={
            userRole === "clients" ? <ProjectNotifications /> : <ProjectLogin />
          }
        />
        <Route
          path="/sites/:slug/adopt-pet"
          element={
            userRole === "clients" ? <ProjectAdoption /> : <ProjectLogin />
          }
        />

        <Route path="sites/:slug/" element={<ProjectHome />} />
        <Route
          path="sites/:slug/terms-and-conditions"
          element={<TermsConditions />}
        />
        <Route path="sites/:slug/approval" element={<ForApproval />} />
        {/* <Route path="sites/:slug/messages" element={<ProjectMessages />} /> */}
        <Route path="/sites/:slug/about" element={<ProjectAbout />} />
        <Route path="/sites/:slug/services" element={<ProjectServices />} />
        <Route path="/sites/:slug/volunteer" element={<ProjectVolunteer />} />
        <Route path="/sites/:slug/donate" element={<ProjectDonate />} />
        <Route path="/sites/:slug/contact" element={<ProjectContact />} />
        <Route path="/sites/:slug/profile" element={<ProjectProfile />} />
        <Route
          path="/sites/:slug/privacy-policy"
          element={<ProjectPrivacyPolicy />}
        />
        <Route path="/sites/:slug/help" element={<ProjectHelp />} />
        <Route path="/sites/:slug/feedback" element={<ProjectFeedback />} />
        {/* <Route
          path="/sites/:slug/notifications"
          element={<ProjectNotifications />}
        /> */}
        <Route
          path="/sites/:slug/adopt-pet/:id"
          element={<ProjectAdoptionInfo />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;

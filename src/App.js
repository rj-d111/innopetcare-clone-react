import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
import HeaderDynamic from "./components/HeaderDynamic"; // Import HeaderDynamic
import Options from "./pages/Options";
import ContentListingPage from "./pages/ContentListingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmailVerification from "./pages/EmailVerification";
import GuestRoute from "./components/GuestRoute";
import Design from "./pages/Design";
import ProjectHome from "./components/projects/ProjectHome";
import ProjectAbout from "./components/projects/ProjectAbout";
import ProjectServices from "./components/projects/ProjectServices";
import ProjectAppointments from "./components/projects/ProjectAppointments";
import ProjectContact from "./components/projects/ProjectContact";
import ProjectLogin from "./components/projects/ProjectLogin";
import ProjectRegister from "./components/projects/ProjectRegister";
import ProjectForgotPassword from "./components/projects/ProjectForgotPassword";
import ForApproval from "./pages/ForApproval";
import TermsConditions from "./pages/TermsConditions";
import ProjectDashboard from "./components/projects/ProjectDashboard";
import ProjectHelp from "./components/projects/ProjectHelp";
import TechAdminLogin from "./pages/TechAdminLogin";
import TechAdminRegister from "./pages/TechAdminRegister";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null); // Track user role
  const auth = getAuth();
  const location = useLocation();
  const [isWebVersion, setWebVersion] = useState(true);

  // Check authentication status and fetch the user's role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        // Fetch user role from Firestore based on UID from both "users" and "clients"
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role); // Fetch role from 'users'
          } else {
            // Check if the user exists in the 'clients' collection
            const clientDocRef = doc(db, "clients", user.uid);
            const clientDoc = await getDoc(clientDocRef);
            if (clientDoc.exists()) {
              const clientData = clientDoc.data();
              setUserRole(clientData.role); // Fetch role from 'clients'
            } else {
              setUserRole(null); // Default to guest if role not found
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null); // Guest user
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Conditionally render headers based on the route
  const renderHeader = () => {
    if (location.pathname.startsWith("/design")) {
      return (
        <HeaderDesign
          isWebVersion={isWebVersion}
          setWebVersion={setWebVersion}
        />
      );
    }

    if (location.pathname === "/sites/") {
      return <HeaderGuest />;
    }
  
    if (location.pathname.includes("/sites/")) {
      return <HeaderDynamic />;
    }
  
    return isAuthenticated ? <Header /> : <HeaderGuest />;
  };

  return (
    <>
      {renderHeader()}

      <Routes>
        <Route path="/" element={isAuthenticated ? <Home /> : <HomeGuest />} />
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
           <Route
          path="/admin"
          element={
            <GuestRoute>
              <TechAdminLogin />
            </GuestRoute>
          }
        />
           <Route
          path="/admin/register"
          element={
            <GuestRoute>
              <TechAdminRegister />
            </GuestRoute>
          }
        />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/sites" element={<ContentListingPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
         <Route path="design" element={<PrivateRoute />}>
          <Route
            path="/design/:id"
            element={
              <Design isWebVersion={isWebVersion} setWebVersion={setWebVersion} />
            }
          />
        </Route>

        {/* Route for client-specific access to appointments */}
        {/* <PrivateProjectRoute>

        </PrivateProjectRoute> */}
        <Route
          path="/sites/:slug/appointments"
          element={
            userRole !== "client" ? <ProjectAppointments /> : <ProjectLogin />
          }
        />
        <Route
          path="/sites/:slug/appointments/register"
          element={
            userRole === "client" ? (
              <ProjectAppointments />
            ) : (
              <ProjectRegister />
            )
          }
        />
        <Route
          path="/sites/:slug/appointments/forgot-password"
          element={
            userRole === "client" ? (
              <ProjectAppointments />
            ) : (
              <ProjectForgotPassword />
            )
          }
        />
        <Route path="sites/:slug/approval" element={<ForApproval /> } />
        <Route path="sites/:slug/terms-and-conditions" element={<TermsConditions /> } />

        {/* Other routes */}
        <Route path="/sites/:slug" element={<ProjectHome />} />
        <Route path="/sites/:slug/about" element={<ProjectAbout />} />
        <Route path="/sites/:slug/services" element={<ProjectServices />} />
        <Route path="/sites/:slug/contact" element={<ProjectContact />} />
        <Route path="/sites/:slug/dashboard" element={<ProjectDashboard />} />
        <Route path="/sites/:slug/help" element={<ProjectHelp />} />
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
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
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

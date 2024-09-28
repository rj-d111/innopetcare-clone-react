import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Corrected useNavigate import
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

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isApproved, setIsApproved] = useState(null); // Add isApproved state
  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isWebVersion, setWebVersion] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const userRoles = ["users", "clients", "tech-admin"];
          let foundRole = null;
          let clientApproved = null;

          for (const role of userRoles) {
            const docRef = doc(db, role, user.uid);
            const userDoc = await getDoc(docRef);

            if (userDoc.exists()) {
              foundRole = role;

              // Fetch the isApproved field for clients
              if (role === "clients") {
                clientApproved = userDoc.data()?.isApproved;
              }

              break;
            }
          }

          setUserRole(foundRole);
          setIsApproved(clientApproved); // Set isApproved state for clients
          console.log(foundRole ? foundRole : "User Role: None");
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

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (location.pathname === "/" && userRole) {
      if (userRole === "tech-admin") {
        navigate("/admin");
      } else if (userRole === "clients") {
        navigate(`/sites/${auth.currentUser?.uid}`);
      } else if (userRole === "users") {
        navigate("/"); // Add redirection to "/" for users
      }
    }
  }, [userRole, location, navigate]);

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
        {/* Other Routes for guests */}
        <Route
          path="/"
          element={userRole == "users" ? <Home /> : <HomeGuest />}
        />
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
          <Route
            path="/design/:id"
            element={
              <Design
                isWebVersion={isWebVersion}
                setWebVersion={setWebVersion}
              />
            }
          />
        </Route>

        {/* Protected Route for Users */}
        {/* <Route element={<PrivateRoute allowedRoles={['users']} />}>
          <Route path="/" element={<Home />} />
        </Route> */}

        {/* Routes for TechAdmin */}
        <Route element={<PrivateRoute allowedRoles={["tech-admin"]} />}>
          <Route path="/admin" element={<TechAdminHome />} />
        </Route>

        {/* Routes for Clients */}
        <Route element={<PrivateRoute allowedRoles={["clients"]} />}>
          <Route path="/sites/:slug/dashboard" element={<ProjectDashboard />} />
        </Route>
             {/* Routes for Clients */}
             <Route element={<PrivateRoute allowedRoles={["clients"]} />}>
          <Route
            path="/sites/:slug/appointments"
            element={
              userRole === "clients"
                ? (isApproved ? <ProjectAppointments /> : <ForApproval />)
                : <ProjectLogin />
            }
          />
        </Route>

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
        <Route path="sites/:slug/approval" element={<ForApproval />} />
        <Route
          path="sites/:slug/terms-and-conditions"
          element={<TermsConditions />}
        />

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

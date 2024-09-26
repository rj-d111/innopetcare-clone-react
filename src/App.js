import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const auth = getAuth();
  const location = useLocation(); // Hook to access the current route
  const [isWebVersion, setWebVersion] = useState(true); // State for toggling between web and mobile views

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set to true if logged in, false otherwise
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
    const pathname = window.location.href;
    if(pathname.includes('sites/')){
      const parts = pathname.split("sites/");
        if(parts[1] != "")
           return <HeaderDynamic />;
    }
    // Default to authenticated or guest headers
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
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/sites" element={<ContentListingPage />} />
        <Route path="profile" element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="design" element={<PrivateRoute />}>
          <Route
            path="/design/:id"
            element={
              <Design isWebVersion={isWebVersion} setWebVersion={setWebVersion} />
            }
          />
        </Route>

        {/* Route for dynamic project pages */}
        <Route path="sites/:slug" element={<ProjectHome />} />
        <Route path="sites/:slug/about" element={<ProjectAbout />} />
        <Route path="sites/:slug/services" element={<ProjectServices />} />
        <Route path="sites/:slug/appointments" element={<ProjectAppointments />} />
        <Route path="sites/:slug/contact" element={<ProjectContact />} />

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

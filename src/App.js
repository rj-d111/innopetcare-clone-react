import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import Options from "./pages/Options";
import ContentListingPage from "./pages/ContentListingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmailVerification from "./pages/EmailVerification";
import GuestRoute from "./components/GuestRoute"; // Import GuestRoute

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const auth = getAuth();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set to true if logged in, false otherwise
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [auth]);

  return (
    <>
      <Router>
        {/* Conditionally render headers */}
        {isAuthenticated ? <Header /> : <HeaderGuest />}

        <Routes>
          {/* Conditionally render Home or HomeGuest based on authentication */}
          <Route path="/" element={isAuthenticated ? <Home /> : <HomeGuest />} />

          {/* Guest-only routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/options" element={<GuestRoute><Options /></GuestRoute>} />

          {/* Other routes */}
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/content-listing-page" element={<ContentListingPage />} />

          {/* Private route for Profile */}
          <Route path="profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>

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
    </>
  );
}

export default App;

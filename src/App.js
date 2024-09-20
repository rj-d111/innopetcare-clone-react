import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HomeGuest from "./pages/HomeGuest";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import Options from "./pages/Options";
import ContentListingPage from "./pages/ContentListingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmailVerification from "./pages/EmailVerification";

function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomeGuest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />{" "}
          <Route path="/home" element={<Home />} />
          <Route path="/options" element={<Options />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route
            path="/content-listing-page"
            element={<ContentListingPage />}
          />
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

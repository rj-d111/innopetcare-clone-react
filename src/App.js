import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HomeGuest from "./pages/HomeGuest";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Header from "./components/Header";
import Options from "./pages/Options";
import ContentListingPage from "./pages/ContentListingPage";
function App() {
  return (
  <>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomeGuest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/options" element={<Options />} />
        <Route path="/content-listing-page" element={<ContentListingPage />} />
      </Routes>
    </Router>
  </>
  );
}

export default App;

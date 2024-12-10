import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
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
import { db, generateToken, messaging } from "./firebase";

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
import ProtectedApprovedUserRoute from "./components/ProtectedApprovedUserRoute";
import UserProfileSummary from "./pages/UserProfileSummary";
import ProjectSettings from "./components/projects/ProjectSettings";
import ProjectProfileSummary from "./components/projects/ProjectProfileSummary";
import OwnerAnimalUsers from "./components/owners/OwnerAnimalUsers";
import OwnerAdoptionsDetails from "./components/owners/OwnerAdoptionsDetails";
import OwnerPetOwnersDetails from "./components/owners/OwnerPetOwnersDetails";
import OwnerAdoptionsDetailsPet from "./components/owners/OwnerAdoptionsDetailsPet";
import AttributesEdit from "./pages/AttributesEdit";
import TechAdminAdditional from "./components/tech-admin/TechAdminAdditional";
import Contact from "./pages/Contact";
import NotificationsCMS from "./pages/NotificationsCMS";
import PrivacySettings from "./pages/PrivacySettings";
import NotFound from "./pages/NotFound";
import TechAdminLogin from "./pages/TechAdminLogin";
import FileManager from "./pages/FileManager";
import PrivateClientsRoute from "./components/PrivateClientsRoute";
import ProjectPrivacySettings from "./components/projects/ProjectPrivacySettings";
import HeaderTechAdmin from "./components/HeaderTechAdmin";
import TechAdminProjectDetails from "./pages/TechAdminProjectDetails";
import ProjectWrapper from "./components/PrivateWrapper";
import useSlugExists from "./components/hooks/useSlugExists";
import ProjectUserFeedback from "./components/projects/ProjectUserFeedback";
import ProjectSendReport from "./components/projects/ProjectSendReport";
import ProjectPets from "./components/projects/ProjectPets";
import ProjectPetsDetails from "./components/projects/ProjectPetsDetails";
import SendReport from "./pages/SendReport";
import TechAdminUserReport from "./components/tech-admin/TechAdminUserReport";
import TechAdminCrystalReport from "./components/tech-admin/TechAdminCrystalReport";
import TechAdminFinancialReports from "./components/tech-admin/TechAdminFinancialReports";
import OwnerSendReport from "./components/owners/OwnerSendReport";
import OwnerFeedback from "./components/owners/OwnerFeedback";
import ProjectHelp from "./components/projects/ProjectHelp";
import ProjectCommunityForum from "./components/projects/ProjectCommunityForum";
import ProjectSinglePost from "./components/projects/ProjectSinglePost";
import { getMessaging, onMessage } from "firebase/messaging";
import useClientSlug from "./components/hooks/useClientSlug";
import Spinner from "./components/Spinner";
import ProjectEmailVerification from "./components/projects/ProjectEmailVerification";


function AppContent() {
  // const { isAuthenticatedForSlug, slug, loading: slugLoading } = useClientSlug(); // Ensure `loading` is provided by the hook
  const [slug, setSlug] = useState("");
  const [ isAuthenticatedForSlug ,setIsAuthenticatedForSlug] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isApproved, setIsApproved] = useState(false); // Track approval status
  const auth = getAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isWebVersion, setWebVersion] = useState(true);
  const [isVerified, setIsVerified] = useState(); // Track email verification status
  const [checkingStatus, setCheckingStatus] = useState(true); // Track if status checks are in progress


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCheckingStatus(true); // Start status checking

      if (user) {
        setIsAuthenticated(true);
        setIsVerified(user.emailVerified); // Set email verification status

        try {
          let foundRole = null;
          let isApprovedStatus = false;

          // Check if user is in tech-admin collection
          const techAdminDocRef = doc(db, "tech-admin", user.uid);
          const techAdminDocSnapshot = await getDoc(techAdminDocRef);
          if (techAdminDocSnapshot.exists()) {
            foundRole = "tech-admin";
            setUserRole(foundRole);
            setIsApproved(true); // Automatically approved for tech-admins
            return;
          }

          // Check other roles (users, clients)
          const userRoles = ["users", "clients"];
          for (const role of userRoles) {
            const userDocRef = doc(db, role, user.uid);
            const userDocSnapshot = await getDoc(userDocRef);

            if (userDocSnapshot.exists()) {
              foundRole = role;
              const userData = userDocSnapshot.data();
              // Check approval status
              isApprovedStatus = userData.status === "approved";

              if(foundRole == "clients"){
                const clientsQuery = query(
                  collection(db, "clients"),
                  where("__name__", "==", user.uid)
                )

                const clientSnapshot = await getDocs(clientsQuery);
                if (clientSnapshot.empty) {
                  console.warn("No matching client document found for UID:", user.uid);
                  setIsAuthenticatedForSlug(false);
                }
                const clientDoc = clientSnapshot.docs[0];
                const { projectId } = clientDoc.data();
          
                const globalSectionDoc = await getDoc(doc(db, "global-sections", projectId));

                if (globalSectionDoc.exists()) {
                  const { slug: projectSlug } = globalSectionDoc.data();
                  setSlug(projectSlug);
                  setIsAuthenticatedForSlug(true);
          
                }
              }

              break; // Stop checking other roles once found
            }
          }

          // Update role and approval status
          setUserRole(foundRole);
          setIsApproved(isApprovedStatus);
        } catch (error) {
          console.error("Error fetching user role or approval status:", error);
          setUserRole(null);
          setIsApproved(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsVerified(null);
        setUserRole(null);
        setIsApproved(false);
      }

      setCheckingStatus(false); // End status checking
    });

    return () => unsubscribe();
  }, []);


  const renderHeader = () => {
    if (location.pathname.startsWith("/admin/login")) {
      return <HeaderGuest />;
    }
    if (location.pathname.startsWith("/admin")) {
      return <HeaderTechAdmin />;
    }

    if (location.pathname === "/sites" || location.pathname === "/sites/") {
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
    if (checkingStatus || !isAuthenticated) return; // Wait until checks are complete


    if(isApproved){
      return;
    }
    if (!isVerified && userRole === "users") {
      navigate("/email-verification"); // Redirect to email verification if not verified
    } else if (!isApproved && userRole === "users") {
      navigate("/approval"); // Redirect to approval if not approved
    }
  }, [isAuthenticated, isVerified, isApproved, userRole, navigate, checkingStatus]);


  
  return (
    <>
      {renderHeader()}

      <Routes>
        <Route element={<ProtectedApprovedUserRoute />}>
          <Route path="/notifications" element={<NotificationsCMS />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/profile/edit" element={<UserProfile />} />
          <Route path="/send-report" element={<SendReport />} />
          <Route path="/profile" element={<UserProfileSummary />} />
          <Route path="/user-feedback" element={<UserFeedback />} />
          <Route path="/privacy-settings" element={<PrivacySettings />} />
          <Route path="/for-approval" element={<UserApproval />} />
          <Route
            path="/design/:id"
            element={
              <Design
                isWebVersion={isWebVersion}
                setWebVersion={setWebVersion}
              />
            }
          />
          {/* <Route path="/help" element={<Help />} /> */}
          <Route path="*" element={<NotFound />} />
        </Route>
              {/* Redirect from "/" to the appropriate "/sites/:slug" */}

        <Route
          path="/"
          element={
            isAuthenticatedForSlug ? (
              <Navigate to={`/sites/${slug}`} />
            ) :   
            isAuthenticated ? (
              userRole === "users" ? (
                isApproved ? (
                  <Home />
                ) : (
                  <Navigate to="/approval" />
                )
              ) : (
                <HomeGuest />
              )
            ) : (
              <HomeGuest />
            )
          }
        />
        {/* Route for the approval page */}
        <Route
          path="/approval"
          element={
            isAuthenticated && isApproved === false ? (
              <UserApproval />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/email-verification"
          element={
            isAuthenticated && !isVerified && !isApproved ? (
              <EmailVerification />
            ) : (
              <Navigate to="/" />
            )
          }
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
        {/* Other general routes */}
        <Route
          element={
            <ProtectedApprovedUserRoute
              isAuthenticated={isAuthenticated}
              isApproved={isApproved}
            />
          }
        >
          {/* Nested protected routes */}
          <Route
            path="/email-verification"
            element={!isVerified ? <EmailVerification /> : <Navigate to="/" />}
          />
          <Route path="/:id/file-manager" element={<FileManager />} />

          <Route path="/:id" element={<OwnerHome />}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="schedule" element={<OwnerSchedule />} />
            <Route path="animal-schedule" element={<OwnerAnimalSchedule />} />
            <Route path="pet-records" element={<OwnerPetHealthRecords />} />
            <Route path="pet-owners" element={<OwnerPetOwners />} />
            <Route path="report" element={<OwnerSendReport />} />
            <Route path="feedback" element={<OwnerFeedback />} />
            <Route
              path="pet-owners/:ownerId"
              element={<OwnerPetOwnersDetails />}
            />
            <Route
              path="pet-owners/:ownerId/:petId"
              element={<OwnerAdoptionsDetailsPet />}
            />
            <Route path="users" element={<OwnerAnimalUsers />} />
            <Route path="messages" element={<OwnerMessages />} />
            <Route path="adoptions" element={<OwnerAdoptions />} />
            <Route
              path="adoptions/:petId"
              element={<OwnerAdoptionsDetails />}
            />
            <Route path="pending" element={<OwnerPending />} />
            {/* Other nested routes */}
          </Route>
        </Route>
        <Route path="/admin/login" element={<TechAdminLogin />} />
        <Route path="/admin/register" element={<TechAdminRegister />} />
        {/* Routes for TechAdmin */}
        <Route element={<PrivateRoute allowedRoles={["tech-admin"]} />}>
          <Route path="/admin" element={<TechAdminHome />}>
            <Route path="users" element={<TechAdminUsers />} />
            <Route path="additional" element={<TechAdminAdditional />} />
            <Route
              path="additional/:id"
              element={<TechAdminProjectDetails />}
            />
            <Route path="users/:id" element={<TechAdminUsersDetails />} />
            <Route path="dashboard" element={<TechAdminDashboard />} />
            <Route path="projects" element={<TechAdminProjects />} />
            <Route path="feedback" element={<TechAdminFeedback />} />
            <Route path="send-report" element={<TechAdminUserReport />} />
            <Route path="report" element={<TechAdminCrystalReport />} />
            <Route path="finance" element={<TechAdminFinancialReports />} />
          </Route>
        </Route>
        {/* Fallback for non-existent routes */}
        <Route path="*" element={<NotFound />} />{" "}
        {/* Redirect to NotFound or a 404 component */}
        {/* Anyone can access */}
        <Route
            path="/sites/:slug/email-verification"
            element={<ProjectEmailVerification />}
          />
        <Route
          path="/sites/:slug/terms-and-conditions"
          element={<TermsConditions />}
        />
        <Route
          path="/sites/:slug/community-forum"
          element={<ProjectCommunityForum />}
        />
        <Route
          path="/sites/:slug/community-forum/:projectId/post/:postId"
          element={<ProjectSinglePost />}
        />
        <Route
          path="/sites/:slug/privacy-policy"
          element={<ProjectPrivacyPolicy />}
        />
        <Route path="/help" element={<Help />} />
        <Route path="/landing-guest" element={<LandingGuest />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/sites" element={<ContentListingPage />} />
        <Route path="/button" element={<AttributesEdit />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/privacy-policy" element={<ProjectPrivacyPolicy />} />
        <Route path="/sites/:slug/register" element={<ProjectRegister />} />
        <Route
          path="/sites/:slug/forgot-password"
          element={<ProjectForgotPassword />}
        />
        {/* Routes for Clients */}
        <Route element={<PrivateClientsRoute allowedRoles={["clients"]} />}>
          <Route
            path="/sites/:slug/appointments"
            element={<ProjectAppointments />}
          />
       
          <Route path="/sites/:slug/dashboard" element={<ProjectDashboard />} />
          <Route path="/sites/:slug/dashboard/pets" element={<ProjectPets />} />
          <Route
            path="/sites/:slug/dashboard/pets/:petId"
            element={<ProjectPetsDetails />}
          />
          <Route path="/sites/:slug/messages" element={<ProjectMessages />} />
          <Route
            path="/sites/:slug/notifications"
            element={<ProjectNotifications />}
          />
          <Route path="/sites/:slug/adopt-pet" element={<ProjectAdoption />} />
          <Route
            path="/sites/:slug/profile"
            element={<ProjectProfileSummary />}
          />
          <Route
            path="/sites/:slug/profile/edit"
            element={<ProjectProfile />}
          />
          <Route path="/sites/:slug/settings" element={<ProjectSettings />} />
          <Route
            path="/sites/:slug/settings/privacy-settings"
            element={<ProjectPrivacySettings />}
          />
          <Route
            path="/sites/:slug/settings/user-feedback"
            element={<ProjectUserFeedback />}
          />
          <Route
            path="/sites/:slug/settings/send-report"
            element={<ProjectSendReport />}
          />
        </Route>
        {/* Only clients Can See this */}
        <Route path="sites/:slug" element={<ProjectWrapper />}>
          <Route index element={<ProjectHome />} />
          <Route path="login" element={<ProjectLogin />} />{" "}
          {/* Login route for each site */}
          <Route path="terms-and-conditions" element={<TermsConditions />} />
          <Route path="approval" element={<ForApproval />} />
          <Route path="about" element={<ProjectAbout />} />
          <Route path="services" element={<ProjectServices />} />
          <Route path="volunteer" element={<ProjectVolunteer />} />
          <Route path="donate" element={<ProjectDonate />} />
          <Route path="contact" element={<ProjectContact />} />
          <Route path="help" element={<ProjectHelp />} />
          {/* Including these protected routes */}
          <Route
            path="/sites/:slug/appointments"
            element={<ProjectAppointments />}
          />
          <Route path="/sites/:slug/dashboard" element={<ProjectDashboard />} />
          <Route path="/sites/:slug/messages" element={<ProjectMessages />} />
          <Route
            path="/sites/:slug/notifications"
            element={<ProjectNotifications />}
          />
          <Route path="/sites/:slug/adopt-pet" element={<ProjectAdoption />} />
          <Route
            path="/sites/:slug/profile"
            element={<ProjectProfileSummary />}
          />
          <Route
            path="/sites/:slug/profile/edit"
            element={<ProjectProfile />}
          />
          <Route path="/sites/:slug/settings" element={<ProjectSettings />} />
          <Route
            path="/sites/:slug/settings/privacy-settings"
            element={<ProjectPrivacySettings />}
          />
          <Route path="/sites/:slug/user-feedback" element={<UserFeedback />} />
          {/* Catch-all route for invalid paths */}
          <Route path="*" element={<NotFound />} />
        </Route>
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

  useEffect(()=>{
    generateToken();
    onMessage(messaging, (payload)=>{
      console.log(payload);
    });
  }, []);
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

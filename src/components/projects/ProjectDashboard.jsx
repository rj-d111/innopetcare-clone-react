import { FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore"; // Firestore functions
import { db } from "../../firebase"; // Import Firebase auth
import { format } from "date-fns"; // Optional for better date formatting
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import messengerLogo from "../../assets/svg/facebook-messenger-brands-solid.svg";
import PetsList from "../owners/PetsList";

export default function ProjectDashboard() {
  const [projectName, setProjectName] = useState(""); // To store projectName
  const [clientName, setClientName] = useState(""); // To store clientName
  const [projectId, setProjectId] = useState(""); // To store projectId
  const [clientId, setClientId] = useState(""); // To store clientId
  const [headerColor, setHeaderColor] = useState(""); // To store headerColorHexCode
  const [upcomingAppointment, setUpcomingAppointment] = useState(null); // To store appointment data
  const [isAnimalShelter, setIsAnimalShelter] = useState(false); // To check project type

  const navigate = useNavigate();
  const auth = getAuth();
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  let slug = "";
  const user = auth.currentUser;
  const userId = user.uid;

  if (parts.length > 1) {
    slug = parts[1].split("/")[0]; // Get the first part after "/"
  }

  // Fetch the clientId based on logged-in user's UID
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setClientId(user.uid);
        setClientName(user.displayName);
      }
    });
  }, [auth]);

  // Fetch the projectId from global-sections table using slug
  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        // Query to find the document with the matching slug
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the first matching document
          const docSnapshot = querySnapshot.docs[0];
          const docData = docSnapshot.data();
          const projectId = docSnapshot.id; // Use document ID as projectId

          setProjectId(projectId);
          setProjectName(docData.name);
          setHeaderColor(docData.headerColor);

          // Fetch project details using the retrieved projectId
          const projectRef = doc(db, "projects", projectId);
          const projectSnapshot = await getDoc(projectRef);

          if (projectSnapshot.exists()) {
            const projectData = projectSnapshot.data();
            console.log(projectData.type);
            setIsAnimalShelter(projectData.type === "Animal Shelter Site");
          } else {
            console.log("Project not found");
          }
        } else {
          console.log(
            "No matching global-sections document found for slug:",
            slug
          );
        }
      } catch (error) {
        console.error("Error fetching projectId: ", error);
      }
    };

    if (slug) {
      fetchProjectId();
    }
  }, [slug]);

  // Fetch the upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (clientId && projectId) {
        try {
          const appointmentsRef = collection(db, "appointments");
          // Fetch all documents matching clientId and projectId without ordering
          const appointmentsQuery = query(
            appointmentsRef,
            where("clientId", "==", clientId),
            where("projectId", "==", projectId)
          );

          const querySnapshot = await getDocs(appointmentsQuery);
          const appointments = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Filter for future appointments
          const upcomingAppointments = appointments
            .map((appointment) => ({
              ...appointment,
              event_datetime: new Date(
                appointment.event_datetime.seconds * 1000
              ),
            }))
            .filter((appointment) => appointment.event_datetime > new Date());

          // Sort the appointments by date (ascending)
          upcomingAppointments.sort(
            (a, b) => a.event_datetime - b.event_datetime
          );

          // Get the closest upcoming appointment
          const foundAppointment = upcomingAppointments[0] || null;
          setUpcomingAppointment(foundAppointment);
        } catch (error) {
          console.error("Error fetching appointments:", error);
        }
      }
    };

    fetchAppointments();
  }, [clientId, projectId]);

  // Helper to format date in human-readable format
  const formatAppointmentDate = (date) => {
    return format(date, "MMMM d, yyyy h:mm a");
  };

  return (
    <div className="bg-gray-200">
      <div className="lg:px-10">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold p-6" style={{ color: headerColor }}>
            Dashboard
          </h1>

          <div className="container mx-auto p-6">
            {/* Welcome Section */}
            <div className="bg-white p-10 rounded-lg shadow-md mb-6">
              <h2 className="text-4xl font-bold">
                Welcome {clientName ?? ""}!
              </h2>
              <p className="text-gray-700 pt-4 text-lg">
                We're happy to see you here at {projectName ?? ""}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Connected Care Corner */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold">
                  Connected Care Center
                </h2>
                <p className="text-gray-700">
                  Stay connected with your care provider:
                </p>

                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FaUserCircle size={44} className="mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        {projectName} - Your Care Team
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {projectName} Admin
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-gray-700">
                    Have questions or need updates about your pet's care? Our
                    team is here to provide support. Use the messaging feature
                    to communicate directly with the{" "}
                    {isAnimalShelter ? "Animal Shelter" : "Veterinary"} Admin,
                    ask questions, and receive updates on your pet’s well-being.
                  </p>

                  <Link
                    to={`/sites/${slug}/messages`}
                    className="mt-4 inline-flex items-center text-white px-4 py-2 rounded-lg transition"
                    style={{
                      backgroundColor: headerColor,
                      hover: { backgroundColor: `${headerColor}cc` }, // Darken on hover
                    }}
                  >
                    <img
                      src={messengerLogo}
                      alt="Messenger Logo"
                      className="h-5 w-5 mr-2 invert"
                    />
                    Start a Conversation
                  </Link>
                </div>
              </div>

              {/* Upcoming Appointment Details */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold">
                  Upcoming Appointment Details
                </h2>
                <div className="flex items-center mt-4">
                  <FaCalendarAlt className="text-6xl" />
                  <div className="ml-4">
                    {upcomingAppointment ? (
                      <div>
                        <p className="text-xl mb-2">
                          Your upcoming appointment is on:{" "}
                          {formatAppointmentDate(
                            upcomingAppointment.event_datetime
                          )}
                        </p>
                        <p>
                          Status:{" "}
                          {upcomingAppointment.status.charAt(0).toUpperCase() +
                            upcomingAppointment.status.slice(1)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl mb-2">No upcoming appointments</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {!isAnimalShelter && (
              <>
                <div className="bg-white p-10 rounded-lg shadow-md mb-6">
                  <h2 className="text-4xl font-bold mb-4">My Pets</h2>

                  {/* Display limited number of pets */}
                  <PetsList
                    clientId={userId}
                    showFilters={false}
                    limit={4}
                    isClient={true}
                    slug={slug}
                  />

                  {/* View All Pets Button */}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => navigate("pets")}
                      className="btn btn-primary"
                    >
                      View All Pets
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore"; // Firestore functions
import { db } from "../../firebase"; // Import Firebase auth
import { format } from "date-fns"; // Optional for better date formatting
import { getAuth } from "firebase/auth";

export default function ProjectDashboard() {
  const [projectName, setProjectName] = useState(""); // To store projectName
  const [clientName, setClientName] = useState(""); // To store projectName
  const [projectId, setProjectId] = useState(""); // To store projectId
  const [clientId, setClientId] = useState(""); // To store clientId
  const [upcomingAppointment, setUpcomingAppointment] = useState(null); // To store appointment data

  const auth = getAuth();
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  let slug = "";

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
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setProjectId(docData.projectId);
          setProjectName(docData.name);
        }
      } catch (error) {
        console.error("Error fetching projectId: ", error);
      }
    };
    fetchProjectId();
  }, [slug]);

  // Fetch the upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (clientId && projectId) {
        try {
          const appointmentsRef = collection(db, "appointments");
          const q = query(
            appointmentsRef,
            where("clientId", "==", clientId),
            where("projectId", "==", projectId),
            where("status", "==", "pending") // Assuming you're looking for pending status
          );

          const querySnapshot = await getDocs(q);
          let foundAppointment = null;

          querySnapshot.forEach((doc) => {
            const appointment = doc.data();
            const appointmentDate = new Date(appointment.event_datetime.seconds * 1000);

            // Only include upcoming appointments (future dates)
            if (appointmentDate > new Date()) {
              foundAppointment = {
                event_datetime: appointmentDate,
                status: appointment.status,
              };
            }
          });

          setUpcomingAppointment(foundAppointment);

        } catch (error) {
          console.error("Error fetching appointments: ", error);
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
          <h1 className="text-3xl font-bold text-blue-600 py-6">Dashboard</h1>

          <div className="container mx-auto p-6">
            {/* Welcome Section */}
            <div className="bg-white p-10 rounded-lg shadow-md mb-6">
              <h2 className="text-4xl font-bold">Welcome {clientName ?? "" }!</h2>
              <p className="text-gray-700 pt-4 text-lg">
                We're happy to see you here at {projectName ?? ""}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Connected Care Corner */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold">
                  Connected Care Corner
                </h2>
                <p className="text-gray-700">Latest Update:</p>
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FaUserCircle size={44} className="mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Precious Confinement - Current Status
                      </h3>
                      <p className="text-sm text-gray-500">
                        by Fort Deo Animal Clinic - Staff
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Hi Sir. I wanted to give you an update on Precious's
                    condition. Unfortunately, he's still not eating as expected.
                    We're closely monitoring his condition and providing
                    supportive care to help him recover from parvovirus. We'll
                    keep you updated on any changes. Please don't hesitate to
                    contact us if you have any concerns.
                  </p>
                  <div className="mt-4">
                    <img
                      src="/images/precious.jpg" // Use a proper path or dynamic image loading
                      alt="Precious the cat"
                      className="rounded-lg w-full object-cover"
                    />
                  </div>
                  <a
                    href="#"
                    className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Go to Pet Owner Forum
                  </a>
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
                        <p>Status: {upcomingAppointment.status.charAt(0).toUpperCase() + upcomingAppointment.status.slice(1)}</p>
                      </div>
                    ) : (
                      <p className="text-xl mb-2">No upcoming appointments</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { db } from "../../firebase"; // Assume you have firebase setup
import {
  doc,
  getDocs,
  collection,
  updateDoc,
  query,
  where,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { MdOutlinePets } from "react-icons/md";

export default function OwnerSchedule() {
  const { id: projectId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch appointments based on projectId
  useEffect(() => {
    const fetchAppointments = async () => {
      const appointmentsQuery = query(
        collection(db, "appointments"),
        where("projectId", "==", projectId)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);

      const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(appointmentsData);
    };

    fetchAppointments();
  }, [projectId]);

  // Fetch clients for mapping
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsSnapshot = await getDocs(collection(db, "clients"));
        const clientsData = clientsSnapshot.docs.reduce((acc, doc) => {
          // Store the client data with the client ID as the key
          acc[doc.id] = {
            id: doc.id,
            name: doc.data().name,
          };
          return acc;
        }, {});
        setClients(clientsData);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
  
    fetchClients();
  }, []);
  

  const handleAction = async (appointmentId, status, eventDatetime, clientId) => {

    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, { status });
  
      toast.success(
        `Successfully ${status === "accepted" ? "Accepted" : "Rejected"} for ${eventDatetime}`
      );
  
      // Insert notification for the client
      await addNotification(clientId, projectId, status, eventDatetime);
  
      // Update local state to reflect changes
      setAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app.id === appointmentId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error("An error occurred while updating the status");
    }
  };
  

  // Function to add notification to Firestore
  const addNotification = async (clientId, projectId, status, eventDatetime) => {
    try {
      const notificationData = {
        type: status === "accepted" ? "Appointment Accepted" : "Appointment Rejected",
        message: `Your appointment for ${eventDatetime} has been ${status}.`,
        timestamp: serverTimestamp(),
        read: false,
      };
  
      // Add notification to Firestore under /notifications/{projectId}/{clientId}/
      const notificationsRef = collection(
        db,
        "notifications",
        projectId,
        clientId
      );
      await addDoc(notificationsRef, notificationData);
  
      console.log("Notification added successfully");
    } catch (error) {
      console.error("Error adding notification:", error);
      toast.error("Failed to send notification");
    }
  };
  

  // Filter and sort appointments by future dates and upcoming order
 // Filter and sort appointments by future dates and upcoming order
const now = new Date();
const filteredAppointments = appointments
  .filter((app) => app.event_datetime.toDate() >= now) // Only upcoming appointments
  .sort((a, b) => a.event_datetime.toDate() - b.event_datetime.toDate()) // Sort by date
  .filter((app) => {
    // Ensure ownerName is retrieved correctly as a string
    const ownerName = clients[app.clientId]?.name || ""; // Use .name to get the actual name string
    return (
      ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.event_datetime.toDate().toLocaleDateString().includes(searchQuery)
    );
  });

  // Format the date to include the day of the week
  const formatDateTime = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="p-6">
      <h2 className="font-semibold text-4xl mb-4">Schedule</h2>

      <div className="flex justify-between my-3">
        <h2 className="font-semibold text-2xl mb-4">Upcoming Appointments</h2>

        {/* Search Bar */}
        <div className="join">
          <input
            className="input input-bordered join-item w-60"
            placeholder="Search by name, pet, or date"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn join-item rounded-r-full">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Appointment List */}
      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((app) => (
          <div
            key={app.id}
            className="flex justify-between mb-4 p-4 border rounded-md"
          >
            <div className="flex items-center">
              <MdOutlinePets
                className="mr-5 text-3xl text-yellow-800"
                size={80}
              />
              <div>
                <p>Pet Name: {app.pet === "No Pets" ? "N/A" : app.pet}</p>
                <p>Pet Owner: {clients[app.clientId]?.name || "Unknown"}</p>
                    <p>Condition: {app.condition}</p>
                <p>Reason: {app.reason}</p>
                <p>Additional Notes: {app.additional}</p>
                <p>
                  Appointment Date:{" "}
                  {formatDateTime(app.event_datetime.toDate())}
                </p>
                <p>
                  Status:{" "}
                  <span
                    className={
                      app.status === "pending"
                        ? "text-orange-500"
                        : app.status === "accepted"
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {app.status}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="btn btn-success text-white"
                onClick={() =>
                  handleAction(
                    app.id,
                    "accepted",
                    app.event_datetime.toDate().toLocaleString(),
                    clients[app.clientId]?.id
                  )
                }
                disabled={app.status === "accepted"}
              >
                Accept
              </button>
              <button
                className="btn bg-red-600 text-white hover:bg-red-800 transition-colors"
                onClick={() =>
                  handleAction(
                    app.id,
                    "rejected",
                    app.event_datetime.toDate().toLocaleString(),
                    app.clientId // Pass the clientId here
                  )
                }
                disabled={app.status === "rejected"}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No appointments found.</p>
      )}
    </div>
  );
}

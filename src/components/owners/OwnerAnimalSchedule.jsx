import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";

export default function OwnerAnimalSchedule() {
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

      await addNotification(clientId, projectId, status, eventDatetime);

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

  const addNotification = async (clientId, projectId, status, eventDatetime) => {
    try {
      const notificationData = {
        type: status === "accepted" ? "Appointment Accepted" : "Appointment Rejected",
        message: `Your appointment for ${eventDatetime} has been ${status}.`,
        timestamp: serverTimestamp(),
        isRead: false,
      };

      const notificationsRef = collection(db, "notifications", projectId, clientId);
      await addDoc(notificationsRef, notificationData);
    } catch (error) {
      console.error("Error adding notification:", error);
      toast.error("Failed to send notification");
    }
  };

  // Filter and sort appointments based on search query
  const now = new Date();
  const filteredAppointments = appointments
    .filter((app) => app.event_datetime.toDate() >= now)
    .sort((a, b) => a.event_datetime.toDate() - b.event_datetime.toDate())
    .filter((app) => {
      const ownerName = clients[app.clientId]?.name || "";
      return (
        ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.event_datetime.toDate().toLocaleDateString().includes(searchQuery)
      );
    });

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
      <h2 className="font-semibold text-4xl mb-4">Animal Shelter Schedule</h2>

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
      <ul className="space-y-6">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => (
            <li key={app.id} className="border p-4 rounded-lg shadow">
              <h3 className="font-semibold text-lg">
                Name: {clients[app.clientId]?.name || "Unknown"}
              </h3>
              <p>Reason For Appointment: {app.reason}</p>
              <p>Appointment Date: {formatDateTime(app.event_datetime.toDate())}</p>
              <p>Number of Visitors: {app.numberOfVisitors || "N/A"}</p>
              <p>Comments/Questions: {app.additional || "None"}</p>
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
              <div className="flex items-center space-x-3 mt-3">
                <button
                  className="btn btn-success text-white"
                  onClick={() =>
                    handleAction(
                      app.id,
                      "accepted",
                      app.event_datetime.toDate().toLocaleString(),
                      app.clientId
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
                      app.clientId
                    )
                  }
                  disabled={app.status === "rejected"}
                >
                  Reject
                </button>
              </div>
            </li>
          ))
        ) : (
          <p>No appointments found.</p>
        )}
      </ul>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { FaSearch, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { db } from "../../firebase";
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

export default function OwnerSchedule() {
  const { id: projectId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch appointments based on projectId
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
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
        read: false,
      };

      const notificationsRef = collection(db, "notifications", projectId, clientId);
      await addDoc(notificationsRef, notificationData);
    } catch (error) {
      console.error("Error adding notification:", error);
      toast.error("Failed to send notification");
    }
  };

  const confirmAction = (appointmentId, status, eventDatetime, clientId) => {
    const confirmation = window.confirm(
      `Are you sure you want to ${
        status === "accepted" ? "accept" : "reject"
      } this appointment for ${eventDatetime}?`
    );

    if (confirmation) {
      handleAction(appointmentId, status, eventDatetime, clientId);
    }
  };

  // Filter and sort appointments
  const now = new Date();
  const filteredAppointments = appointments
    .filter((app) => {
      if (filterStatus !== "all") return app.status === filterStatus;
      return true;
    })
    .filter((app) => app.event_datetime.toDate() >= now)
    .sort((a, b) => a.event_datetime.toDate() - b.event_datetime.toDate())
    .filter((app) => {
      const ownerName = clients[app.clientId]?.name || "";
      return (
        ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.pet.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const statusIcons = {
    accepted: <FaCheckCircle className="text-green-500" />,
    pending: <FaClock className="text-yellow-500" />,
    rejected: <FaTimesCircle className="text-red-500" />,
  };

  return (
    <div className="p-6">
      <h2 className="font-semibold text-4xl mb-4">Veterinary Schedule</h2>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 my-3">
        <div className="flex gap-2 flex-wrap">
          {["all", "accepted", "pending", "rejected"].map((status) => (
            <button
              key={status}
              className={`btn ${
                filterStatus === status ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center">
          <input
            className="input input-bordered w-60"
            placeholder="Search by name, pet, or date"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn rounded-l-none">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Appointment List */}
      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((app) => (
          <div
            key={app.id}
            className="flex justify-between items-start mb-4 p-4 border rounded-md"
          >
            <div>
              <p>
                <span className="font-bold">Pet Name:</span>{" "}
                {app.pet === "No Pets" ? "N/A" : app.pet}
              </p>
              <p>
                <span className="font-bold">Pet Owner:</span>{" "}
                {clients[app.clientId]?.name || "Unknown"}
              </p>
              <p>
                <span className="font-bold">Condition:</span> {app.condition}
              </p>
              <p>
                <span className="font-bold">Reason:</span> {app.reason}
              </p>
              <p>
                <span className="font-bold">Additional Notes:</span>{" "}
                {app.additional}
              </p>
              <p>
                <span className="font-bold">Appointment Date:</span>{" "}
                {formatDateTime(app.event_datetime.toDate())}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold">Status:</span> {statusIcons[app.status]}
                <span
                  className={
                    app.status === "pending"
                      ? "text-orange-500"
                      : app.status === "accepted"
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                className="btn btn-success text-white"
                onClick={() =>
                  confirmAction(
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
                  confirmAction(
                    app.id,
                    "rejected",
                    app.event_datetime.toDate().toLocaleString(),
                    clients[app.clientId]?.id
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

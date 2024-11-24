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
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaQuestionCircle,
} from "react-icons/fa";

export default function OwnerAnimalSchedule() {
  const { id: projectId } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  const handleAction = async (
    appointmentId,
    status,
    eventDatetime,
    clientId
  ) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, { status });

      toast.success(
        `Successfully ${
          status === "accepted" ? "Accepted" : "Rejected"
        } for ${eventDatetime}`
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

  const addNotification = async (
    clientId,
    projectId,
    status,
    eventDatetime
  ) => {
    try {
      const notificationData = {
        type:
          status === "accepted"
            ? "Appointment Accepted"
            : "Appointment Rejected",
        message: `Your appointment for ${eventDatetime} has been ${status}.`,
        timestamp: serverTimestamp(),
        read: false,
      };

      const notificationsRef = collection(
        db,
        "notifications",
        projectId,
        clientId
      );
      await addDoc(notificationsRef, notificationData);
    } catch (error) {
      console.error("Error adding notification:", error);
      toast.error("Failed to send notification");
    }
  };

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

  // Filter and sort appointments based on status and search query
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
        app.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.event_datetime.toDate().toLocaleDateString().includes(searchQuery)
      );
    });

  const statusIcons = {
    accepted: <FaCheckCircle className="text-green-500" />,
    pending: <FaClock className="text-yellow-500" />,
    rejected: <FaTimesCircle className="text-red-500" />,
    default: <FaQuestionCircle className="text-gray-500" />,
  };

  return (
    <div className="p-6">
      <h2 className="font-semibold text-4xl mb-4">Animal Schedule</h2>

      <div className="flex flex-wrap items-center justify-between gap-4 my-3">
        {/* Filter Buttons */}
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
            placeholder="Search by name, reason of appointment"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn rounded-l-none">
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
                <span className="font-bold">Name:</span> {clients[app.clientId]?.name || "Unknown"}
              </h3>
              <p><span className="font-bold">Reason For Appointment:</span> {app.reason}</p>
              <p>
                <span className="font-bold">Appointment Date:</span> {formatDateTime(app.event_datetime.toDate())}
              </p>
              <p><span className="font-bold">Number of Visitors:</span> {app.numberOfVisitors || "N/A"}</p>
              <p><span className="font-bold">Comments/Questions:</span> {app.additional || "None"}</p>
              <p className="flex items-center gap-2">
                <span className="font-bold">Status:</span> {statusIcons[app.status] || statusIcons.default}
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
              <div className="flex items-center space-x-3 mt-3">
                <button
                  className="btn btn-success text-white"
                  onClick={() =>
                    confirmAction(
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
                    confirmAction(
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

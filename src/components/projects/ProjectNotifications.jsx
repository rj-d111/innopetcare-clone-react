import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Make sure your Firebase configuration is correct
import { FaTimes, FaClock } from "react-icons/fa";
import { getAuth } from "firebase/auth";

export default function ProjectNotifications() {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser; // Get the currently logged-in user
  const [projectId, setProjectId] = useState(null); // Store projectId
  const [slug, setSlug] = useState("");

  // Extract slug from URL
  useEffect(() => {
    const pathname = window.location.href;
    const parts = pathname.split("sites/");
    if (parts.length > 1) {
      const extractedSlug = parts[1].split("/")[0];
      setSlug(extractedSlug);
    }
  }, []);

  // Fetch project data to get the projectId
  useEffect(() => {
    const fetchProjectId = async () => {
      const q = query(
        collection(db, "global-sections"),
        where("slug", "==", slug)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setProjectId(data.projectId); // Set the projectId from global-sections
      }
    };

    if (slug) {
      fetchProjectId();
    }
  }, [slug]);

  // Fetch notifications in real-time
  useEffect(() => {
    if (user && projectId) {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("clientId", "==", user.uid), // Match clientId to current user's ID
        where("projectId", "==", projectId) // Match projectId to current project
      );

      const unsubscribe = onSnapshot(notificationsQuery, (querySnapshot) => {
        const notificationsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsArray);
      });

      return () => unsubscribe();
    }
  }, [user, projectId]);

  return (
<div className="bg-gray-100 min-h-screen flex items-start justify-center p-5">
  <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mt-10"> {/* Added mt-10 for spacing from top */}
    <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

    {notifications.length === 0 ? (
      <p className="text-center text-gray-500">No notifications available.</p>
    ) : (
      notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-start border-b border-gray-200 py-4"
        >
          {/* Close Icon */}
          <div className="mr-4 mt-2">
            <FaTimes className="text-gray-400 hover:text-red-500 cursor-pointer" />
          </div>

          {/* Notification Content */}
          <div className="w-full">
            <div className="flex justify-between">
              {/* Notification Type */}
              <span className="text-white text-xs font-bold px-2 py-1 rounded bg-blue-500">
                {notification.type}
              </span>

              {/* Notification Time */}
              <div className="flex items-center text-gray-400 text-sm">
                <FaClock className="mr-2" />
                {new Date(notification.timestamp?.seconds * 1000).toLocaleString()}
              </div>
            </div>

            {/* Notification Message */}
            <p className="text-gray-600 text-sm mt-1">
              {notification.message}
            </p>
          </div>
        </div>
      ))
    )}
  </div>
</div>

  );
}

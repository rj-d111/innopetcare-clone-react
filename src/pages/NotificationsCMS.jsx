import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { FaTimes, FaClock } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export default function NotificationsCMS() {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const notificationsRef = collection(db, "notifications", user.uid, "notifications");
      const q = query(notificationsRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(notificationsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      const notificationDoc = doc(db, "notifications", user.uid, "notifications", notificationId);
      await updateDoc(notificationDoc, { read: true });
      toast.info("Notification marked as read");
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter((notification) => !notification.read);
  
      if (unreadNotifications.length > 0) {
        unreadNotifications.forEach((notification) => {
          const notificationDoc = doc(db, "notifications", user.uid, "notifications", notification.id);
          batch.update(notificationDoc, { read: true });
        });
  
        await batch.commit();
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({ ...notification, read: true }))
        );
        toast.success("All notifications marked as read");
      } else {
        toast.info("All notifications have already been read.");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  
  const deleteNotification = async (notificationId) => {
    try {
      const notificationDoc = doc(db, "notifications", user.uid, "notifications", notificationId);
      await deleteDoc(notificationDoc);
      toast.success("Notification deleted successfully");
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const capitalizeFirstLetter = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-64px)] flex items-start justify-center p-5 overflow-auto">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <button
            onClick={markAllAsRead}
            className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
          >
            Mark all as read
          </button>
        </div>
  
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">No notifications available.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start border-b border-gray-200 py-4 cursor-pointer"
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              {/* Close Icon */}
              <div className="mr-4 mt-2" onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}>
                <FaTimes className="text-red-500 cursor-pointer" />
              </div>
    
              {/* Notification Content */}
              <div className="w-full">
                {/* Title and Date Row */}
                <div className="flex flex-col sm:flex-row justify-between">
                  <span className="text-white text-xs font-bold px-2 py-1 rounded bg-blue-500">
                    {capitalizeFirstLetter(notification.type || "Notification")}
                  </span>
    
                  {/* Notification Time */}
                  <div className="flex items-center text-gray-400 text-sm mt-2 sm:mt-0 sm:ml-4">
                    <FaClock className="mr-2" />
                    {notification.timestamp
                      ? new Date(notification.timestamp.seconds * 1000).toLocaleString()
                      : "No timestamp"}
                  </div>
                </div>
    
                {/* Notification Message */}
                <p className={`mt-2 text-sm ${notification.read ? "text-gray-600" : "text-gray-800 font-bold"}`}>
                  {notification.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

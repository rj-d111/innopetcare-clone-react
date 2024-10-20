import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";
import { IoMdSend } from "react-icons/io";

export default function ProjectMessages() {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [projectId, setProjectId] = useState(null); // Store projectId
  const auth = getAuth();
  const user = auth.currentUser;
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

  // Fetch project data and set projectId
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setUserData({
            image: data.image,
            name: data.name,
          });
          setProjectId(data.projectId); // Set projectId from global-sections
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (slug) {
      fetchUserData();
    }
  }, [slug]);

  // Fetch messages in real-time based on projectId and user ID
  useEffect(() => {
    if (user && projectId) {
      const q = query(
        collection(db, "messages"),
        where("projectId", "==", projectId), // Use projectId to get messages for the project
        orderBy("timestamp")
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesArray);
        console.log("Messages fetched:", messagesArray); // Debugging line to check if messages are fetched
      });

      return () => unsubscribe();
    }
  }, [db, user, projectId]);

  // Handle sending a message
  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        senderId: user.uid,
        projectId: projectId, // Save projectId with the message
        timestamp: serverTimestamp(),
      });
      setNewMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-300 p-4 border-r border-gray-200">
        <h2 className="font-semibold text-lg mb-4">Chats</h2>
        <div className="flex items-center mb-4">
          {/* Profile Image */}
          <img
            src={userData?.image || "/default-profile.png"} // fallback in case image isn't fetched
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          <div>
            <p className="font-medium">{userData?.name || "User Name"} (Admin)</p>
            <p className="text-gray-500 text-sm">You: It's really difficult...</p>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-3/4 p-4 flex flex-col">
        <div className="flex items-center mb-4">
          {/* Chat header with profile image and name */}
          <img
            src={userData?.image || "/default-profile.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <p className="font-medium text-lg">{userData?.name || "Chat Name"} (Admin)</p>
        </div>

        {/* Message Thread */}
        <div className="flex-grow overflow-y-auto flex flex-col space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user.uid ? "justify-end" : "justify-start"}`}
              >
                <div className={`p-3 rounded-xl max-w-md ${message.senderId === user.uid ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}>
                  {message.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="mt-6 flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 flex-grow"
          />
          <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-2 rounded-lg">
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { IoMdSend } from "react-icons/io";

export default function OwnerMessages() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const { id } = useParams(); // Get projectId from the URL

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Fetch messages where projectId matches
        const messagesQuery = query(
          collection(db, "messages"),
          where("projectId", "==", id)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesData = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);

        // Fetch unique sender info
        const uniqueSenderIds = [...new Set(messagesData.map((msg) => msg.senderId))];
        const usersData = {};
        for (const senderId of uniqueSenderIds) {
          const userDoc = await getDocs(
            query(collection(db, "clients"), where("uid", "==", senderId))
          );
          if (!userDoc.empty) {
            usersData[senderId] = userDoc.docs[0].data();
          }
        }
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [id]);

  return (
    <div>
      <h2 className="font-semibold text-4xl mb-4">Chats</h2>

      <div className="flex flex-row flex-grow">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-300 p-4 border-r border-gray-200">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-center mb-4">
              <img
                src={users[msg.senderId]?.image || "/default-profile.png"}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover mr-3"
              />
              <div>
                <p className="font-medium">
                  {users[msg.senderId]?.name || "Unknown Sender"}
                </p>
                <p className="text-gray-500 text-sm">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Section */}
        <div className="w-3/4 p-4">
          <div className="flex flex-col space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === "adminId" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.senderId !== "adminId" && (
                  <img
                    src={users[msg.senderId]?.image || "/default-profile.png"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover mr-2"
                  />
                )}
                <div
                  className={`p-3 rounded-xl max-w-md ${
                    msg.senderId === "adminId"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="mt-6 flex items-center">
            <input
              type="text"
              placeholder="Type a message..."
              className="border border-gray-300 rounded-lg p-2 flex-grow"
            />
            <button className="ml-2 bg-blue-500 text-white p-2 rounded-lg">
              <IoMdSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

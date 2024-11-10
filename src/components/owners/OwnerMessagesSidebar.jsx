import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";

export default function OwnerMessagesSidebar({ onUserSelect }) {
  const { id: projectId } = useParams();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const auth = getAuth();
  useEffect(() => {
    const fetchClients = async () => {
      const q = query(
        collection(db, "clients"),
        where("projectId", "==", projectId)
      );
      const querySnapshot = await getDocs(q);

      const clientsData = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const clientData = { id: docSnapshot.id, ...docSnapshot.data() };
          const chatId = [projectId, clientData.id].sort().join("_"); // Unique chat ID
          const chatDocRef = doc(db, "chats", chatId);
          const chatDoc = await getDoc(chatDocRef);

          if (chatDoc.exists()) {
            const chatData = chatDoc.data();
            const lastMessage = chatData.lastMessage || "";
            const isAdminLast = chatData.lastSenderId === projectId; // Assuming `projectId` is adminId

            clientData.lastMessage = isAdminLast
              ? `You: ${lastMessage}`
              : lastMessage;
            clientData.isSeenByAdmin = chatData.isSeenByAdmin || false;
          } else {
            // clientData.lastMessage = "No messages yet";
            clientData.lastMessage = "";
            clientData.isSeenByAdmin = true; // No need to mark as unread if no messages
          }

          return clientData;
        })
      );

      setClients(clientsData);
      setFilteredClients(clientsData);
    };

    fetchClients();
  }, [projectId]);

  useEffect(() => {
    const filtered = clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  const handleClick = async (client) => {
    // Update isSeenByAdmin if necessary
    if (!client.isSeenByAdmin) {
      const chatId = [projectId, client.id].sort().join("_");
      const chatDocRef = doc(db, "chats", chatId);
      await updateDoc(chatDocRef, { isSeenByAdmin: true });

      // Update local state to reflect the read status
      setClients((prevClients) =>
        prevClients.map((c) =>
          c.id === client.id ? { ...c, isSeenByAdmin: true } : c
        )
      );
    }

    // Update the admin's lastActivityTime in the users table
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, { lastActivityTime: serverTimestamp() });

    // Pass the selected client details to the parent component
    onUserSelect(client.name, client.lastActivityTime, client.id);
  };

  return (
    <div className="w-1/3 bg-gray-100 py-4 border-r border-gray-200">
      <h2 className="font-semibold text-4xl pl-4 mb-4">Chats</h2>
      <div className="join px-4 w-full">
        <input
          className="input input-bordered join-item w-full"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn join-item rounded-r-full bg-yellow-500 hover:bg-yellow-600 text-white">
          <FaSearch />
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <li
              key={client.id}
              onClick={() => handleClick(client)}
              className={`rounded-lg cursor-pointer transition p-3 ${
                client.isSeenByAdmin
                  ? "bg-white hover:bg-gray-300"
                  : "bg-yellow-100 hover:bg-yellow-200"
              }`}
            >
              <div className="flex items-center">
                <FaUserCircle className="mr-2 text-2xl" />
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-lg ${client.isSeenByAdmin ? "" : "text-blue-700 font-bold"}`}>
                    {client.name}
                  </div>
                  <div className={`text-sm ${client.isSeenByAdmin ? "text-gray-500" : "text-gray-800 font-bold"} truncate`}>
                    {client.lastMessage}
                  </div>
                </div>
                {!client.isSeenByAdmin && (
                  <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-semibold">
                    NEW
                  </span>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500 mt-4">No clients found</li>
        )}
      </ul>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function OwnerMessagesSidebar({ onUserSelect }) {
  const { id: projectId } = useParams();
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    const fetchApprovedClientsAndCreateChats = async () => {
      try {
        // Query for approved clients with matching projectId
        const clientsQuery = query(
          collection(db, "clients"),
          where("status", "==", "approved"),
          where("projectId", "==", projectId)
        );

        const clientsSnapshot = await getDocs(clientsQuery);

        const clientPromises = clientsSnapshot.docs.map(async (clientDoc) => {
          const clientData = clientDoc.data();
          const uid = clientDoc.id;
          const chatDocId = `${projectId}_${uid}`;

          // Check if chat document exists
          const chatRef = doc(db, "chats", chatDocId);
          const chatSnap = await getDoc(chatRef);

          if (!chatSnap.exists()) {
            // Create a new chat document
            await setDoc(chatRef, {
              participants: [projectId, uid],
              lastMessage: "",
              lastSenderId: "",
              lastTimestamp: serverTimestamp(),
              isSeenByAdmin: false,
              isSeenByClient: false,
              clientId: uid,
              projectId: projectId,
            });
          }

          return { id: uid, ...clientData };
        });

        const resolvedClients = await Promise.all(clientPromises);
        setClients(resolvedClients);
        setFilteredClients(resolvedClients);
      } catch (error) {
        console.error("Error fetching clients or creating chats:", error);
      }
    };

    fetchApprovedClientsAndCreateChats();
  }, [projectId]);

  useEffect(() => {
    // Fetch chats where projectId matches and order by lastTimestamp descending
    const chatsQuery = query(
      collection(db, "chats"),
      where("projectId", "==", projectId),
      orderBy("lastTimestamp", "desc")
    );

    const unsubscribeChats = onSnapshot(chatsQuery, async (querySnapshot) => {
      const chatDocs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const clientPromises = chatDocs.map(async (chat) => {
        console.log(chat);
        const clientRef = doc(db, "clients", chat.clientId);
        const clientSnap = await getDoc(clientRef);
        if (clientSnap.exists()) {
          const clientData = clientSnap.data();
          return {
            id: chat.clientId,
            ...clientData,
            lastMessage: chat.lastMessage || "No messages yet",
            lastActivityTime: clientData.lastActivityTime
              ? clientData.lastActivityTime.toDate()
              : null,
            isSeenByAdmin: chat.isSeenByAdmin ?? false,
          };
        }
        return null;
      });

      const resolvedClients = (await Promise.all(clientPromises)).filter(
        (client) => client !== null
      );

      setClients(resolvedClients);
      setFilteredClients(resolvedClients);
    });

    return () => unsubscribeChats();
  }, [projectId]);

  useEffect(() => {
    const filtered = clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  const handleClick = async (client) => {
    // Update the 'isSeenByAdmin' field to true in the 'chats' collection
    const chatRef = doc(db, "chats", `${projectId}_${client.id}`); // Assuming client.id is the chat document ID
    try {
      await updateDoc(chatRef, {
        isSeenByAdmin: true,
      });

      // Proceed with other actions
    } catch (error) {
      console.error("Error updating chat document:", error);
    } finally {
      onUserSelect(client.name, client.lastActivityTime, client.id);
    }
  };

  return (
    <div className="w-1/3 bg-gray-100 py-4 border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-scroll">
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
                {client.profileImage ? (
                  <img
                    src={client.profileImage}
                    alt={`${client.name}'s avatar`}
                    className="mr-2 w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="mr-2 text-2xl text-gray-500" />
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className={
                      client.isSeenByAdmin
                        ? `font-normal text-lg`
                        : `font-semibold text-lg`
                    }
                  >
                    {client.name}
                  </div>
                  <div
                    className={`text-sm text-gray-500 truncate ${
                      client.isSeenByAdmin ? "font-normal" : "font-semibold"
                    }`}
                  >
                    {!client.isSeenByAdmin && (
                      <span className="badge badge-info badge-xs mr-2"></span>
                    )}
                    {client.lastMessage}
                  </div>
                </div>
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

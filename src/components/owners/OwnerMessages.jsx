import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, setDoc, updateDoc, orderBy, onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db, storage } from "../../firebase";
import { getAuth } from "firebase/auth"; 
import { IoMdSend } from "react-icons/io";
import { FaFileAlt, FaUserCircle } from "react-icons/fa";
import OwnerMessagesSidebar from "./OwnerMessagesSidebar";
import { AiFillPicture } from "react-icons/ai";
import { Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Spinner from "../../components/Spinner"; // Import Spinner component

const getLastActiveStatus = (lastActivityTime) => {
  if (!lastActivityTime) return "";
  
  console.log(lastActivityTime);
  const now = new Date();
  const lastActivityDate = 
    lastActivityTime instanceof Date ? lastActivityTime :
    typeof lastActivityTime?.toDate === "function" ? lastActivityTime.toDate() :
    new Date(lastActivityTime);

  if (isNaN(lastActivityDate)) return { status: "Unknown", color: "bg-gray-500" };

  const diffMillis = now - lastActivityDate;
  const diffMinutes = Math.floor(diffMillis / (60 * 1000));

  if (diffMinutes < 10) return { status: "Active now", color: "bg-green-500" };
  if (diffMinutes < 60) return { status: `Active ${diffMinutes} min ago`, color: "bg-yellow-500" };
  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return { status: `Active ${hours} hr${hours > 1 ? "s" : ""} ago`, color: "bg-orange-500" };
  }
  const days = Math.floor(diffMinutes / 1440);
  return { status: `Active ${days} day${days > 1 ? "s" : ""} ago`, color: "bg-red-500" };
};

export default function OwnerMessages() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedUser, setSelectedUser] = useState({ name: "", uid: "", lastActivityTime: null });
  const { id: adminId } = useParams();
  const [chatId, setChatId] = useState(null);
  const [isSending, setIsSending] = useState(false); // State to track sending status

  useEffect(() => {
    if (!selectedUser.uid) return;

  
    const chatDocId = [adminId, selectedUser.uid].join("_");
    const chatDocRef = doc(db, "chats", chatDocId);
    const messagesCollectionRef = collection(chatDocRef, "messages");
    const messagesQuery = query(messagesCollectionRef, orderBy("timestamp"));
  
    const initializeChat = async () => {
      // Ensure the chat document exists
      const chatSnapshot = await getDocs(messagesCollectionRef);
      if (chatSnapshot.empty) {
        await setDoc(chatDocRef, { participants: [adminId, selectedUser.uid] }, { merge: true });
      }
    };
  
    initializeChat();
  
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(messagesData);
      setMessages(messagesData);
    });
  
    // Set the chat ID for sending messages
    setChatId(chatDocId);
  
    // Cleanup the subscription when the component unmounts or dependencies change
    return () => unsubscribe();
  }, [adminId, selectedUser.uid]);

  const handleUserSelect = (name, lastActivityTime, uid) => {
    setSelectedUser({ name, lastActivityTime, uid });
  };

  const updateLastActivityTime = async () => {
    const auth = getAuth();
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, { lastActivityTime: serverTimestamp() });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chatId || isSending) return; // Prevent duplicate sending
  
    setIsSending(true); // Show spinner when sending starts
    const messageData = {
      text: messageText,
      senderId: adminId,
      receiverId: selectedUser.uid,
      timestamp: serverTimestamp(),
      type: "text",
      isSeen: false,
    };
  
    const chatDocRef = doc(db, "chats", chatId);
    const messagesCollectionRef = collection(chatDocRef, "messages");
  
    try {
      // Add the message to Firestore
      const messageRef = await addDoc(messagesCollectionRef, messageData);
  
      // Update the chat document with the latest message info
      await setDoc(
        chatDocRef,
        {
          participants: [adminId, selectedUser.uid],
          lastMessage: messageText,
          lastTimestamp: serverTimestamp(),
          lastSenderId: adminId,
          isSeenByAdmin: true,
          isSeenByClient: false,
        },
        { merge: true }
      );
  
      // Update the local state
      setMessages((prev) => {
        const exists = prev.some(
          (msg) => msg.id === messageRef.id || msg.timestamp === messageData.timestamp
        );
        if (exists) return prev; // If the message already exists, return the current state unchanged
        return [
          ...prev,
          { ...messageData, id: messageRef.id, timestamp: new Date() },
        ];
      });
      
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false); // Hide spinner after sending
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !chatId) return;

    setIsSending(true); // Show spinner when file is uploading
    const fileRef = ref(storage, `messages/${chatId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(fileRef);

    const messageData = {
      fileUrl,
      fileName: file.name,
      senderId: adminId,
      receiverId: selectedUser.uid,
      timestamp: serverTimestamp(),
      type: file.type.includes("image") ? "image" : "file",
      isSeen: false,
    };

    const chatDocRef = doc(db, "chats", chatId);
    const messagesCollectionRef = collection(chatDocRef, "messages");
    await addDoc(messagesCollectionRef, messageData);

    await setDoc(
      chatDocRef,
      {
        participants: [adminId, selectedUser.uid],
        lastMessage: file.type.includes("image") ? "Image" : file.name,
        lastTimestamp: serverTimestamp(),
        isSeenByAdmin: true,
        isSeenByClient: false,
      },
      { merge: true }
    );

    await updateLastActivityTime();

    setMessages((prev) => {
      const newMessages = [...prev, { ...messageData, timestamp: new Date() }];
      return newMessages.sort((a, b) => a.timestamp - b.timestamp); 
    });

    setIsSending(false); // Hide spinner after upload
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const lastActive = getLastActiveStatus(selectedUser.lastActivityTime);

  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="flex flex-row h-full">
        <OwnerMessagesSidebar onUserSelect={handleUserSelect} />

        <div className="w-3/4 flex flex-col">
          {!selectedUser.name ? (
            <div className="flex items-center justify-center flex-grow bg-gray-100">
              <h2 className="text-lg text-gray-500">Please select a user from the list</h2>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 p-4 flex items-center space-x-4">
                <h2 className="text-2xl font-semibold">{selectedUser.name}</h2>
                {lastActive.status && (
                  <span
                    className={`px-2 py-1 rounded-full text-white text-sm font-medium ${lastActive.color}`}
                  >
                    {lastActive.status}
                  </span>
                )}
              </div>

              <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.senderId === adminId ? "justify-end" : "justify-start"}`}
                  >
                    {msg.senderId !== adminId && (
                      <FaUserCircle size={40} className="mr-3" />
                    )}
                    <div
                      className={`p-3 rounded-xl max-w-md ${msg.senderId === adminId ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                    >
                      {msg.type === "text" && msg.text}
                      {msg.type === "image" && (
                        <img src={msg.fileUrl} alt="attachment" className="w-32" />
                      )}
                      {msg.type === "file" && (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          <FaFileAlt className="text-gray-600" />
                          <span>{msg.fileName}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-300">
                <div className="flex items-center space-x-3">
                  {isSending && <Spinner />} {/* Show Spinner when sending */}
                  <label>
                    <FaFileAlt className="text-gray-600 cursor-pointer" />
                    <input
                      type="file"
                      accept="application/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                  </label>
                  <label>
                    <AiFillPicture className="text-gray-600 cursor-pointer" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                  </label>
                  <textarea
                    placeholder="Type a message..."
                    className="border border-gray-300 rounded-lg p-2 flex-grow resize-none"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={messageText.split("\n").length} // Adjust height based on line count
                  />
                  <button
                    className="ml-2 bg-blue-500 text-white p-2 rounded-lg"
                    onClick={handleSendMessage}
                  >
                    <IoMdSend />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

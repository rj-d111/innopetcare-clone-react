import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "../../firebase";
import { getAuth } from "firebase/auth";
import { IoMdSend } from "react-icons/io";
import { FaFileAlt, FaUserCircle } from "react-icons/fa";
import { AiFillPicture } from "react-icons/ai";
import Spinner from "../../components/Spinner";
import { Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams } from "react-router";

const getLastActiveStatus = (lastActivityTime) => {
  if (!lastActivityTime) return "";

  const now = Timestamp.now().toDate();
  const lastActivityDate = lastActivityTime.toDate();
  const diffMillis = now - lastActivityDate;
  const diffMinutes = Math.floor(diffMillis / (60 * 1000));

  if (diffMinutes < 10) return { status: "Active now", color: "bg-green-500" };
  if (diffMinutes < 60)
    return { status: `Active ${diffMinutes} min ago`, color: "bg-yellow-500" };
  if (diffMinutes < 1440) {
    const hours = Math.floor(diffMinutes / 60);
    return {
      status: `Active ${hours} hr${hours > 1 ? "s" : ""} ago`,
      color: "bg-orange-500",
    };
  }
  const days = Math.floor(diffMinutes / 1440);
  return {
    status: `Active ${days} day${days > 1 ? "s" : ""} ago`,
    color: "bg-red-500",
  };
};

export default function ProjectMessages() {
  const [userData, setUserData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [headerColor, setHeaderColor] = useState("#2563eb");
  const [chatId, setChatId] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const { slug } = useParams();

  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          const projectId = querySnapshot.docs[0].id;

          // Set the projectId and extracted data
          setProjectId(projectId);
          setHeaderColor(docData["headerColor"]);
        } else {
          console.log("No matching documents found");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProjectId();
  }, [slug]); // Add `slug` as a dependency

  useEffect(() => {
    console.log(projectId);
    if (!projectId) return;

    const fetchOrCreateChat = async () => {
      const chatDocId = [projectId, user.uid].join("_");
      setChatId(chatDocId); // Set chatId to use in message references
      const chatDocRef = doc(db, "chats", chatDocId);
      const messagesCollectionRef = collection(chatDocRef, "messages");
      const messagesQuery = query(messagesCollectionRef, orderBy("timestamp"));

      try {
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesData = messagesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchOrCreateChat();
  }, [projectId, user.uid]);

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
            lastActivityTime: data.lastActivityTime,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (slug) fetchUserData();
  }, [slug]);

  const sendMessage = async () => {
    if (!messageText.trim() || !chatId) return;
  
    setIsSending(true);
    const messageData = {
      text: messageText,
      senderId: user.uid,
      receiverId: projectId,
      timestamp: serverTimestamp(),
      type: "text",
      isSeen: false,
    };
  
    const chatDocRef = doc(db, "chats", chatId);
    const messagesCollectionRef = collection(chatDocRef, "messages");
  
    try {
      // Add the message to the messages sub-collection
      await addDoc(messagesCollectionRef, messageData);
  
      // Update the chat document with last message details
      await setDoc(
        chatDocRef,
        {
          participants: [user.uid, projectId],
          lastMessage: messageText,
          lastTimestamp: serverTimestamp(),
          isSeenByAdmin: user.role === "client" ? false : true,
          isSeenByClient: user.role === "client" ? true : false,
        },
        { merge: true }
      );
  
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };
  

  const handleFileUpload = async (file, type) => {
    if (!file || !projectId) return;
  
    setIsSending(true);
    const fileRef = ref(storage, `messages/${projectId}_${user.uid}/${file.name}`);
    
    try {
      // Upload the file to Firebase Storage
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);
  
      const messageData = {
        fileUrl,
        fileName: file.name,
        senderId: user.uid,
        receiverId: projectId,
        timestamp: serverTimestamp(),
        type,
        isSeen: false,
      };
  
      const chatDocRef = doc(db, "chats", chatId);
      const messagesCollectionRef = collection(chatDocRef, "messages");
  
      // Add the message to the messages sub-collection
      await addDoc(messagesCollectionRef, messageData);
  
      // Update the chat document with the last message details
      await setDoc(
        chatDocRef,
        {
          participants: [user.uid, projectId],
          lastMessage: type === "image" ? "Image" : file.name,
          lastTimestamp: serverTimestamp(),
          isSeenByAdmin: user.role === "client" ? false : true,
          isSeenByClient: user.role === "client" ? true : false,
        },
        { merge: true }
      );
  
      // Clear the file input (if needed)
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsSending(false);
    }
  };
  

  useEffect(() => {
    if (!chatId) return;
  
    const chatDocRef = doc(db, "chats", chatId);
    const messagesCollectionRef = collection(chatDocRef, "messages");
    const q = query(messagesCollectionRef, orderBy("timestamp", "asc"));
  
    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });
  
    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [chatId]);
  

  const lastActive = getLastActiveStatus(userData?.lastActivityTime);

  return (
    <div className="flex h-[calc(100vh-72px)]">
      <div className="w-1/4 bg-gray-300 p-4 border-r border-gray-200">
        <h2 className="font-semibold text-lg mb-4">Chats</h2>
        <div className="flex items-center mb-4">
          <img
            src={userData?.image || "/default-profile.png"}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          <div>
            <p className="font-medium">
              {userData?.name || "User Name"} (Admin)
            </p>
            {lastActive.status && (
              <span
                className={`px-2 py-1 rounded-full text-white text-sm font-medium ${lastActive.color}`}
              >
                {lastActive.status}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="w-3/4 p-4 flex flex-col">
        <div className="flex-grow overflow-y-auto flex flex-col space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === user.uid
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl max-w-md ${
                    message.senderId !== user.uid
                      ? "bg-gray-200 text-black"
                      : ""
                  }`}
                  style={
                    message.senderId === user.uid
                      ? { backgroundColor: headerColor, color: "white" }
                      : {}
                  }
                >
                  {message.type === "text" ? (
                    <p>{message.text || ""}</p>
                  ) : message.type === "image" ? (
                    <img
                      src={message.fileUrl}
                      alt="Attachment"
                      className="max-w-full rounded"
                    />
                  ) : (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{color: message.senderId === user.uid ? "white" : headerColor}}
                      >
                      {message.fileName || "File"}
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-300">
          <div className="flex items-center space-x-3">
            {isSending && <Spinner />}
            <label>
              <FaFileAlt className="text-gray-600 cursor-pointer" />
              <input
                type="file"
                accept="application/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0], "file")}
              />
            </label>
            <label>
              <AiFillPicture className="text-gray-600 cursor-pointer" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0], "image")}
              />
            </label>
            <textarea
              placeholder="Type a message..."
              className="border border-gray-300 rounded-lg p-2 flex-grow resize-none"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={messageText.split("\n").length}
            />
            <button
              className="ml-2 text-white p-2 rounded-lg"
              style={{backgroundColor: headerColor}}
              onClick={sendMessage}
              disabled={isSending}
            >
              <IoMdSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

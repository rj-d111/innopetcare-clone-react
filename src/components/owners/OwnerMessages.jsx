import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase";

export default function OwnerMessages() {
  const [userData, setUserData] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const [slug, setSlug] = useState(""); 

  useEffect(() => {
    const pathname = window.location.href;
    const parts = pathname.split("sites/");
    if (parts.length > 1) {
      const extractedSlug = parts[1].split("/")[0];
      setSlug(extractedSlug);
    }
  }, []);

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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [db, slug]);

  return (
    <div>
      <h2 className="font-semibold text-4xl mb-4">Chats</h2>

      <div className="flex flex-row flex-grow">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-300 p-4 border-r border-gray-200">
          <div className="flex items-center mb-4">
            {/* Profile Image */}
            <img
              src={userData?.image || "/default-profile.png"} // fallback in case image isn't fetched
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover mr-3"
            />
            <div>
              <p className="font-medium">{userData?.name || "User Name"}</p>
              <p className="text-gray-500 text-sm">
                You: It's really difficult...
              </p>
            </div>
          </div>
          {/* Add more chat list items here */}
        </div>
        {/* Chat Section */}
        <div className="w-3/4 p-4">
          <div className="flex items-center mb-4">
            {/* Chat header with profile image and name */}
            <img
              src={userData?.image || "/default-profile.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <p className="font-medium text-lg">{userData?.name || "Chat Name"}</p>
          </div>
          {/* Message Thread */}
          <div className="flex flex-col space-y-4">
            {/* Sent message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white p-3 rounded-xl max-w-md">
                Thanks for reaching out. Your sublet looks perfect for my needs!
                I'd like to know if it's available from May to August, and if
                utilities are included in the rent?
              </div>
            </div>
            {/* Received message */}
            <div className="flex items-start">
              <img
                src={userData?.image || "/default-profile.png"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
              <div className="bg-gray-200 text-black p-3 rounded-xl max-w-md">
                I'm glad you like the place. Yes, the sublet is available from May
                to August. And yes, utilities like water, electricity, and
                internet are included in the rent.
              </div>
            </div>
            {/* Sent message */}
            <div className="flex justify-end">
              <div className="bg-blue-500 text-white p-3 rounded-xl max-w-md">
                Let me know if you'd like to schedule a viewing or need more
                photos!
              </div>
            </div>
          </div>
          {/* Message Input */}
          <div className="mt-6 flex items-center">
            <input
              type="text"
              placeholder="Type a message..."
              className="border border-gray-300 rounded-lg p-2 flex-grow"
            />
            <button className="ml-2 bg-blue-500 text-white p-2 rounded-lg">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

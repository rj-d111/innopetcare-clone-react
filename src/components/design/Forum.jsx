import {
    collection,
    getDocs,
    query,
    updateDoc,
    where,
    addDoc, // Import addDoc to add a new document
  } from "firebase/firestore";
  import React, { useState, useEffect } from "react"; // Import useEffect for fetching initial data
  import { useParams } from "react-router";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { db } from "../../firebase";
  
  export default function Forum() {
    const { id } = useParams();
    console.log(id);
  
    const [isEnabled, setIsEnabled] = useState(false);
    const [isUpdateMode, setIsUpdateMode] = useState(false);
    const [forumInfo, setForumInfo] = useState({
      isEnabled: null,
    });
  
    // Fetch existing forum info when the component mounts
    useEffect(() => {
      const fetchForumInfo = async () => {
        const q = query(
          collection(db, "forum-page"),
          where("projectId", "==", id)
        );
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setForumInfo(docData);
          setIsEnabled(docData.isEnabled); // Set the enabled state based on fetched data
          setIsUpdateMode(true); // Switch to update mode
        }
      };
  
      fetchForumInfo();
    }, [id]);
  
    const toggleForumPage = async (e) => {
      const newState = !isEnabled;
      setIsEnabled(newState);
      setForumInfo({ isEnabled: newState }); // Update forumInfo state
      toast.success(`Your forum page is now ${newState ? "enabled" : "disabled"}`);
  
      if (isUpdateMode) {
        const q = query(
          collection(db, "forum-page"),
          where("projectId", "==", id)
        );
        const querySnapshot = await getDocs(q);
        const docRef = querySnapshot.docs[0].ref; // Get the reference of the first matching document
  
        await updateDoc(docRef, { isEnabled: newState }); // Update the isEnabled field
      } else {
        await addDoc(collection(db, "forum-page"), {
          ...forumInfo,
          projectId: id, // Foreign key linking to the project
        });
        setIsUpdateMode(true); // Switch to update mode after saving
      }
    };
  
    return (
      <>
        <div className="p-6 md:max-w-full  mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-screen">
          <div className="bg-yellow-100 p-4 rounded-md">
            <h2 className="text-lg font-semibold">Forum Page</h2>
            <p className="text-sm text-gray-700">
              A forum page is a section of a website dedicated to discussions and
              interactions among users.
            </p>
          </div>
  
          <div className="flex items-center">
            <input
              type="checkbox"
              className="toggle toggle-warning"
              checked={isEnabled}
              onChange={toggleForumPage} // Toggles the state
            />
            <p className="ml-2">Enable Forum Page</p>
          </div>
        </div>
      </>
    );
  }
  
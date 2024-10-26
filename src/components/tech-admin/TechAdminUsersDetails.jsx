import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import Spinner from "../Spinner";

export default function TechAdminUsersDetails() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [documentUrls, setDocumentUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Step 1: Get the user document based on the provided ID
        const userRef = doc(db, "users", id);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserData(userData);

          // Step 2: Get the UID from the user data
          const uid = userData.uid; // assuming the uid field is in the user data
          console.log("Retrieved UID:", uid);

          // Step 3: Load document files
          const storage = getStorage();
          const documentPromises = (userData.documentFiles || []).map(
            async (docFile) => {
              const fileRef = ref(storage, docFile.url);
              const fullUrl = await getDownloadURL(fileRef);
              return { name: docFile.name || "Unnamed Document", url: fullUrl };
            }
          );

          const urls = await Promise.all(documentPromises);
          setDocumentUrls(urls);
        } else {
          setUserData({});
          toast.error("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [id]);

  const handleApproval = async (status) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { isApproved: status });
      setUserData((prevState) => ({ ...prevState, isApproved: status }));
      toast.success("Approval status updated successfully");
      if (status) {
        await createProject();
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
    }
  };

  const createProject = async () => {
    try {
      setLoading(true);

      const projectsRef = collection(db, "projects");

      const projectData = {
        createdAt: serverTimestamp(),
        name: userData.legalName || "N/A",
        status: "pending",
        type:
          userData.typeOfAdmin === "Veterinary Admin"
            ? "Veterinary Site"
            : "Animal Shelter Site",
        userId: id, // Use the ID to associate the project with the user
      };

      const q = query(projectsRef, where("name", "==", projectData.name));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(projectsRef, projectData);
        toast.success(
          `Your ${projectData.type} Project "${projectData.name}" created successfully!`
        );
      } else {
        toast.info(`Your project "${projectData.name}" already exists!`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">User Details</h2>

      <div className="mb-4 flex items-center space-x-2">
        <strong>Approved:</strong>
        {userData.isApproved ? (
          <FaCheckCircle className="text-green-500" />
        ) : (
          <IoIosCloseCircle className="text-red-500" />
        )}
      </div>

      <div className="mb-4">
        <strong>Name:</strong> {userData.name || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Created at:</strong>{" "}
        {userData.createdAt && userData.createdAt.seconds
          ? new Date(userData.createdAt.seconds * 1000).toLocaleString()
          : "N/A"}
      </div>

      <div className="mb-4">
        <strong>Email:</strong> {userData.email || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Phone:</strong> {userData.phone || "N/A"}
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2">Business Details</h3>
      <div className="mb-4">
        <strong>Type of Admin:</strong> {userData.typeOfAdmin || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Legal Name/Company Name:</strong> {userData.legalName || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Business Registration Number:</strong>{" "}
        {userData.businessRegNumber || "N/A"}
      </div>

      <div className="mb-4">
        <strong>City:</strong> {userData.city || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Postal Code:</strong> {userData.postalCode || "N/A"}
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2">Documents</h3>
      <div>
        {documentUrls.length > 0 ? (
          documentUrls.map((doc, index) => (
            <div key={index} className="mb-2">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {doc.name || "Unnamed Document"}
              </a>
            </div>
          ))
        ) : (
          <div className="mb-2">No documents available</div>
        )}
      </div>

      <div className="mt-6">
        {userData.isApproved ? (
          <button
            disabled
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            Approved
          </button>
        ) : (
          <button
            onClick={() => handleApproval(true)}
            className="bg-green-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Approve
          </button>
        )}

        {!userData.isApproved ? (
          <button
            disabled
            className="bg-gray-300 text-gray-700 px-4 py-2 ml-2 rounded"
          >
            Denied
          </button>
        ) : (
          <button
            onClick={() => handleApproval(false)}
            className="bg-red-500 text-white px-4 py-2 ml-2 rounded"
            disabled={loading}
          >
            Deny
          </button>
        )}
      </div>
    </div>
  );
}

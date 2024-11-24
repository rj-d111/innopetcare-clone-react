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
  onSnapshot,
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
  const [disableButtons, setDisableButtons] = useState({
    approve: false,
    reject: false,
  });

  console.log(userData);

  useEffect(() => {
    const unsubscribeUser = onSnapshot(
      doc(db, "users", id),
      async (userSnapshot) => {
        try {
          if (!userSnapshot.exists()) {
            setUserData({});
            toast.error("User not found.");
            return;
          }
  
          const userData = userSnapshot.data();
  
          // Real-time query for projects associated with the user
          const projectsRef = collection(db, "projects");
          const q = query(projectsRef, where("userId", "==", id));
  
          const unsubscribeProjects = onSnapshot(q, async (projectSnapshot) => {
            let projectData = {};
            if (!projectSnapshot.empty) {
              const projectDoc = projectSnapshot.docs[0];
              projectData = projectDoc.data();
            } else {
              toast.info("No project data found for this user.");
            }
  
            // Combine user and project data
            const combinedData = {
              ...userData,
              createdAt: projectData.createdAt,
              typeOfAdmin: projectData.type,
              legalName: projectData.name || "N/A",
              businessRegNumber: projectData.businessRegNumber || "N/A",
              city: projectData.city || "N/A",
              postalCode: projectData.postalCode || "N/A",
              documentFiles: projectData.documentFiles || [],
            };
  
            setUserData(combinedData);
  
            // Fetch document URLs from storage
            const storage = getStorage();
            const documentPromises = (combinedData.documentFiles || []).map(
              async (docFile) => {
                const fileRef = ref(storage, docFile.url);
                const fullUrl = await getDownloadURL(fileRef);
                return { name: docFile.name || "Unnamed Document", url: fullUrl };
              }
            );
  
            const urls = await Promise.all(documentPromises);
            setDocumentUrls(urls);
          });
  
          // Cleanup subscription for projects
          return () => unsubscribeProjects();
        } catch (error) {
          console.error("Error fetching user or project data:", error);
          toast.error("Error fetching data.");
        }
      },
      (error) => {
        console.error("Error listening to user document:", error);
      }
    );
  
    // Cleanup subscription for user
    return () => unsubscribeUser();
  }, [id]);

  const handleApproval = async (isApproved) => {
    try {
      const userRef = doc(db, "users", id);
  
      if (isApproved) {
        await updateDoc(userRef, { status: "approved" });
        setUserData((prevState) => ({
          ...prevState,
          status: "approved",
        }));
        setDisableButtons({ approve: true, reject: true });
        toast.success("User approved successfully");
        await createProject();
      } else {
        await updateDoc(userRef, { status: "rejected" });
        setUserData((prevState) => ({
          ...prevState,
          status: "rejected",
        }));
        setDisableButtons((prev) => ({ ...prev, reject: true }));
        toast.success("User rejected successfully");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
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
        type: userData.type,
        userId: id,
      };

      const q = query(projectsRef, where("name", "==", projectData.name));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(projectsRef, projectData);
        toast.success(
          `Your ${projectData.type} Project "${projectData.name}" created successfully!`
        );
      } else {
        // toast.info(`Your project "${projectData.name}" already exists!`);
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
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">User Details</h2>

      <div className="mb-4 flex items-center space-x-2">
        <strong>Approved:</strong>
        {userData.status === "approved" ? (
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

      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => handleApproval(true)}
          className={`px-4 py-2 rounded text-white ${
            userData.status !== "pending"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          }`}
          disabled={userData.status !== "pending"}
        >
          Approve
        </button>
        <button
          onClick={() => handleApproval(false)}
          className={`px-4 py-2 rounded text-white ${
            userData.status !== "pending"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
          disabled={userData.status !== "pending"}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

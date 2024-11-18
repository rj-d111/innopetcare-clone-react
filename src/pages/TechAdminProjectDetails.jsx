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
import { db } from "../firebase";
import { toast } from "react-toastify";
import { FaCheckCircle, FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import Spinner from "../components/Spinner";

export default function TechAdminProjectDetails() {
  const { id: projectId } = useParams(); // Get projectId from the URL
  const [projectData, setProjectData] = useState(null);
  const [documentUrls, setDocumentUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [disableButtons, setDisableButtons] = useState({ approve: false, reject: false });

  // Fetch project data from the "projects-waiting" collection
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectRef = doc(db, "projects-waiting", projectId);
        const projectSnapshot = await getDoc(projectRef);

        if (projectSnapshot.exists()) {
          const data = projectSnapshot.data();
          setProjectData(data);

          const storage = getStorage();
          const documentPromises = (data.documentFiles || []).map(async (docFile) => {
            const fileRef = ref(storage, docFile.url);
            const fullUrl = await getDownloadURL(fileRef);
            return { name: docFile.name || "Unnamed Document", url: fullUrl };
          });

          const urls = await Promise.all(documentPromises);
          setDocumentUrls(urls);
        } else {
          toast.error("Project not found.");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Error fetching project data.");
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Approve or Reject the project
  const handleApproval = async (status) => {
    try {
      const projectRef = doc(db, "projects-waiting", projectId);

      if (status) {
        await updateDoc(projectRef, { isApproved: true, isRejected: null });
        setProjectData((prev) => ({ ...prev, isApproved: true, isRejected: undefined }));
        setDisableButtons({ approve: true, reject: true });
        toast.success("Project approved successfully");
        await moveToProjects();
      } else {
        await updateDoc(projectRef, { isApproved: false, isRejected: true });
        setProjectData((prev) => ({ ...prev, isApproved: false, isRejected: true }));
        setDisableButtons({ approve: false, reject: true });
        toast.success("Project rejected successfully");
      }
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast.error("Error updating approval status.");
    }
  };

  // Move approved project to "projects" collection
  const moveToProjects = async () => {
    try {
      const projectsRef = collection(db, "projects");

      const projectDataToAdd = {
        createdAt: serverTimestamp(),
        name: projectData.legalName || "N/A",
        status: "pending",
        type:
          projectData.typeOfAdmin === "Veterinary Admin"
            ? "Veterinary Site"
            : "Animal Shelter Site",
        userId: projectId,
      };

      const q = query(projectsRef, where("name", "==", projectDataToAdd.name));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(projectsRef, projectDataToAdd);
        toast.success(`Project "${projectDataToAdd.name}" created successfully!`);
      } else {
        toast.info(`Project "${projectDataToAdd.name}" already exists.`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Error creating project.");
    }
  };

  // Function to determine file icon
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-red-600 mr-2" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-600 mr-2" />;
      default:
        return <FaFileAlt className="text-gray-600 mr-2" />;
    }
  };

  // Function to check if the file is an image
  const isImageFile = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
  };

  if (!projectData) {
    return <Spinner />;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
      <div className="mb-4">
        <strong>Name:</strong> {projectData.name || "N/A"}
      </div>
      <div className="mb-4">
        <strong>Created at:</strong>{" "}
        {projectData.createdAt && projectData.createdAt.seconds
          ? new Date(projectData.createdAt.seconds * 1000).toLocaleString()
          : "N/A"}
      </div>
      <div className="mb-4">
        <strong>Type of Admin:</strong> {projectData.type || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Legal Name/Company Name:</strong> {projectData.name || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Business Registration Number:</strong>{" "}
        {projectData.businessRegNumber || "N/A"}
      </div>

      <div className="mb-4">
        <strong>City:</strong> {projectData.city || "N/A"}
      </div>

      <div className="mb-4">
        <strong>Postal Code:</strong> {projectData.postalCode || "N/A"}
      </div>


      <h3 className="text-xl font-semibold mt-6 mb-2">Documents Submitted</h3>
      <div>
        {documentUrls.length > 0 ? (
          documentUrls.map((doc, index) => (
            <div key={index} className="mb-2 flex items-center">
              {isImageFile(doc.name) ? (
                <img src={doc.url} alt={doc.name} className="h-20 w-20 object-cover rounded-md" />
              ) : (
                <button onClick={() => window.open(doc.url, "_blank")} className="flex items-center p-2 bg-gray-200 rounded-md">
                  {getFileIcon(doc.name)}
                  <span>{doc.name}</span>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="mb-2">No documents available</div>
        )}
      </div>

      {/* <div className="flex gap-4 mt-6">
        <button
          onClick={() => handleApproval(true)}
          disabled={disableButtons.approve}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <FaCheckCircle className="inline mr-2" /> Approve
        </button>
        <button
          onClick={() => handleApproval(false)}
          disabled={disableButtons.reject}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          <IoIosCloseCircle className="inline mr-2" /> Reject
        </button>
      </div> */}
    </div>
  );
}

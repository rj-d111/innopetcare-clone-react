import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBan,
  FaPaw,
  FaClinicMedical,
  FaRegUser,
} from "react-icons/fa";

export default function TechAdminDashboardUsers() {
  const [sites, setSites] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalVetSites, setTotalVetSites] = useState(0);
  const [totalShelterSites, setTotalShelterSites] = useState(0);
  // Fetch data from Firestore
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const globalSectionsCollection = collection(db, "global-sections");
        const globalSectionsSnapshot = await getDocs(globalSectionsCollection);
  
        if (globalSectionsSnapshot.empty) {
          console.warn("No global sections found");
          setSites([]);
          return;
        }
  
        // Fetch data concurrently using Promise.all
        const fetchedSites = await Promise.all(
          globalSectionsSnapshot.docs.map(async (sectionDoc) => {
            try {
              const sectionData = sectionDoc.data();
              const sectionId = sectionDoc.id;
  
              // Fetch project data using sectionId
              const projectDocRef = doc(db, "projects", sectionId);
              const projectSnapshot = await getDoc(projectDocRef);
              const projectData = projectSnapshot.exists() ? projectSnapshot.data() : null;
  
              if (!projectData) {
                console.warn(`No project found for sectionId: ${sectionId}`);
                return null;
              }
  
              const userId = projectData.userId;
              if (!userId) {
                console.warn(`No userId found in project: ${sectionId}`);
                return null;
              }
  
              // Fetch user data using projectData.userId
              const userDocRef = doc(db, "users", userId);
              const userSnapshot = await getDoc(userDocRef);
              const userData = userSnapshot.exists() ? userSnapshot.data() : {};
  
              // Count clients associated with this project
              const clientsQuery = query(
                collection(db, "clients"),
                where("projectId", "==", projectDocRef.id)
              );
              const clientsSnapshot = await getDocs(clientsQuery);
              const clientsCount = clientsSnapshot.size;
  
              return {
                projectId: projectDocRef.id,
                siteName: sectionData.name || "N/A",
                userName: userData.name || "N/A",
                status: projectData.status || "N/A",
                type: projectData.type || "N/A",
                address: sectionData.address || "N/A",
                location: sectionData.location || "N/A",
                image: sectionData.image || "",
                clientsCount,
              };
            } catch (error) {
              console.error(`Error processing section: ${sectionDoc.id}`, error);
              return null;
            }
          })
        );
  
        // Filter out null entries and sort by status
        const validSites = fetchedSites.filter((site) => site !== null);
        const sortedSites = validSites.sort((a, b) => {
          if (a.status === "active" && b.status !== "active") return -1;
          if (a.status !== "active" && b.status === "active") return 1;
          return 0;
        });
  
        setSites(sortedSites);
      } catch (error) {
        console.error("Error fetching sites:", error);
      }
    };
  
    fetchSites();
  }, []);
  

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // 1. Count all clients
        const clientsCollection = collection(db, "clients");
        const clientsSnapshot = await getDocs(clientsCollection);
        const totalClientsCount = clientsSnapshot.size;
        setTotalClients(totalClientsCount);

        // 2. Count Veterinary Sites with status === "active"
        const vetSitesQuery = query(
          collection(db, "projects"),
          where("type", "==", "Veterinary Site"),
          where("status", "==", "active")
        );
        const vetSitesSnapshot = await getDocs(vetSitesQuery);
        const totalVetSitesCount = vetSitesSnapshot.size;
        setTotalVetSites(totalVetSitesCount);

        // 3. Count Animal Shelter Sites with status === "active"
        const shelterSitesQuery = query(
          collection(db, "projects"),
          where("type", "==", "Animal Shelter Site"),
          where("status", "==", "active")
        );
        const shelterSitesSnapshot = await getDocs(shelterSitesQuery);
        const totalShelterSitesCount = shelterSitesSnapshot.size;
        setTotalShelterSites(totalShelterSitesCount);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, []);




  // Function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FaCheckCircle className="text-green-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "disabled":
        return <FaBan className="text-gray-500" />;
      case "rejected":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  // Function to get type icon
  const getTypeIcon = (type) => {
    return type === "Veterinary Site" ? (
      <FaClinicMedical className="text-blue-500" />
    ) : (
      <FaPaw className="text-orange-500" />
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Sites</h2>

              {/* Statistics Section */}
      <div className="stats shadow mb-6">
        <div className="stat">
          <div className="stat-figure text-secondary">
            <FaRegUser size={25} />
          </div>
          <div className="stat-title">No. of Clients</div>
          <div className="stat-value">{totalClients}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Active Veterinary Clinic Sites</div>
          <div className="stat-value">{totalVetSites}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Active Animal Shelter Sites</div>
          <div className="stat-value">{totalShelterSites}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 border">Site Name</th>
              <th className="p-4 border">User Name</th>
              <th className="p-4 border">Site Status</th>
              <th className="p-4 border">Type</th>
              <th className="p-4 border">Address</th>
              <th className="p-4 border">Location</th>
              <th className="p-4 border">No. of Clients</th>
            </tr>
          </thead>
          <tbody>
            {sites.length > 0 ? (
              sites.map((site, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {/* Site Name with Image */}
                  <td className="p-4 border">
                    <div className="flex items-start gap-2">
                      {site.image ? (
                        <img
                          src={site.image}
                          alt={site.siteName}
                          className="max-h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="max-h-12 w-12 rounded-full bg-gray-300" />
                      )}
                      <span>{site.siteName}</span>
                    </div>
                  </td>

                  {/* User Name */}
                  <td className="p-4 border">{site.userName}</td>
                  {/* Site Status */}
                  <td className="p-4 border">
                    {getStatusIcon(site.status)} {site.status}
                  </td>
                  {/* Type */}
                  <td className="p-4 border">
                    {getTypeIcon(site.type)} {site.type}
                  </td>
                  {/* Address */}
                  <td className="p-4 border">{site.address}</td>
                  {/* Location */}
                  <td className="p-4 border">
                    {typeof site.location === "object"
                      ? `${site.location.latitude.toFixed(
                          4
                        )}°, ${site.location.longitude.toFixed(4)}°`
                      : "N/A"}
                  </td>
                  {/* Clients Count */}
                  <td className="p-4 border">{site.clientsCount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

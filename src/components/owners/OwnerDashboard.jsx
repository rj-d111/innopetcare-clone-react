import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { useLocation, useParams } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { IoCloseCircle, IoTimeOutline } from "react-icons/io5";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

export default function OwnerDashboard() {
  const [clients, setClients] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [graphData, setGraphData] = useState({});
  const [graphView, setGraphView] = useState("weekly");
  const { id } = useParams();
  const [isAnimalShelter, setIsAnimalShelter] = useState(false);
  const location = useLocation(); // Access location object


  const graphOptions = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          autoSkip: true, // Automatically adjust skipping based on space
        },
      },
      y: {
        ticks: {
          min: 0,
          stepSize: 1, // Ensure only whole numbers on the Y-axis as well
        },
      },
    },
  };

  useEffect(() => {
    const db = getFirestore();


    const fetchProject = async () => {
      try {
        const projectDoc = doc(db, "projects", id);
        const projectSnapshot = await getDoc(projectDoc);
        if (projectSnapshot.exists()) {
          const projectData = projectSnapshot.data();
          setIsAnimalShelter(projectData.type === "Animal Shelter Site");
        } else {
          console.error("Project not found");
        }
      } catch (error) {
        console.error("Error fetching project data");
      }
    };



    const fetchClients = async () => {
      const clientsRef = collection(db, "clients");
      const q = query(clientsRef, where("projectId", "==", id));
      const querySnapshot = await getDocs(q);

      const clientsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setClients(clientsData);
      setUserCount(clientsData.length);

      // Count pending approvals
      const pending = clientsData.filter(
        (client) => client.status === "pending"
      );
      setPendingCount(pending.length);

      // Prepare graph data
      prepareGraphData(clientsData, graphView);
    };

    if (id) {
      fetchClients();
      fetchProject();
    }
  }, [id, graphView]);

  const prepareGraphData = (clientsData, view) => {
    const now = new Date();
    const filteredData = clientsData.filter((client) => {
      const accountCreatedDate = new Date(client.accountCreated.seconds * 1000);
      return view === "weekly"
        ? now - accountCreatedDate <= 7 * 24 * 60 * 60 * 1000
        : now - accountCreatedDate <= 30 * 24 * 60 * 60 * 1000;
    });

    const counts = {};
    filteredData.forEach((client) => {
      const date = new Date(client.accountCreated.seconds * 1000)
        .toISOString()
        .slice(0, 10); // Format as YYYY-MM-DD
      counts[date] = (counts[date] || 0) + 1;
    });

    const labels = Object.keys(counts).sort();
    const data = labels.map((label) => counts[label]);

    setGraphData({
      labels,
      datasets: [
        {
          label: `Registered Users (${view})`,
          data,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
        },
      ],
    });
  };

  function getAccountStatus(accountCreated) {
    if (!accountCreated || !accountCreated.seconds) {
      return "N/A"; // Return "N/A" if accountCreated is missing or invalid
    }
  
    const accountCreatedDate = new Date(accountCreated.seconds * 1000); // Convert Firestore timestamp to Date
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1); // One year ago from today
  
    if (accountCreatedDate >= oneYearAgo) {
      return "active"; // Account created within the last year
    } else if (accountCreatedDate < oneYearAgo) {
      return "inactive"; // Account created more than a year ago
    }
  
    return "N/A"; // Default case (should not be reached)
  }

  return (
    <div className="p-6">
      <h2 className="font-semibold text-4xl mb-4">Dashboard</h2>
      <div className="stats shadow mb-6">
        <div className="stat">
          <div className="stat-figure text-secondary">
            <FaRegUser size={25} />
          </div>
          <div className="stat-title">No. of Registered Users</div>
          <div className="stat-value">{userCount}</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-yellow-500">
            <IoTimeOutline size={25} />
          </div>
          <div className="stat-title">Pending Approvals</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
      </div>

      {/* Graph Section */}
      <div className="mb-6">
        <label htmlFor="graph-view" className="block mb-2 font-semibold">
          View by:
        </label>
        <select
          id="graph-view"
          value={graphView}
          onChange={(e) => setGraphView(e.target.value)}
          className="border border-gray-300 rounded p-2"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <div className="mt-4 md:w-1/2">
          {graphData.labels && graphData.labels.length > 0 ? (
            <Line data={graphData} options={graphOptions} />
          ) : (
            <p>No data available for the selected view.</p>
          )}
        </div>
      </div>

      {/* Table Section */}
      <table className="min-w-full border-collapse border border-gray-200 mt-4">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Phone</th>
            {!isAnimalShelter && (
              <th className="border border-gray-300 p-2">Status</th>
            )}
            <th className="border border-gray-300 p-2">Account Created</th>
            <th className="border border-gray-300 p-2">Account Status</th>{" "}
            {/* New Column */}
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="border border-gray-300 p-2">{client.name}</td>
              <td className="border border-gray-300 p-2">{client.email}</td>
              <td className="border border-gray-300 p-2">{client.phone}</td>
              {!isAnimalShelter && (
              <td className="border border-gray-300 p-2">
                <div className="flex flex-col items-center">
                  {client.status === "approved" ? (
                    <>
                      <FaCircleCheck className="text-green-500" size={20} />
                      <div className="text-green-500">Approved</div>
                    </>
                  ) : client.status === "pending" ? (
                    <>
                      <IoTimeOutline className="text-yellow-500" size={20} />
                      <div className="text-yellow-500">Pending</div>
                    </>
                  ) : (
                    <>
                      <IoCloseCircle className="text-red-500" size={20} />
                      <div className="text-red-500">Rejected</div>
                    </>
                  )}
                </div>
              </td>
              )}
              <td className="border border-gray-300 p-2">
              {client.accountCreated
                ? new Date(client.accountCreated.seconds * 1000).toLocaleString()
                : "N/A"}
            </td>
            <td className="border border-gray-300 p-2"> {/* Account Status */}
              <div className="flex flex-col items-center">
                {getAccountStatus(client.accountCreated) === "active" ? (
                  <>
                    <FaCircleCheck className="text-green-500" size={20} />
                    <div className="text-green-500">Active</div>
                  </>
                ) : getAccountStatus(client.accountCreated) === "inactive" ? (
                  <>
                    <IoCloseCircle className="text-red-500" size={20} />
                    <div className="text-red-500">Inactive</div>
                  </>
                ) : (
                  <>
                    <IoTimeOutline className="text-gray-500" size={20} />
                    <div className="text-gray-500">N/A</div>
                  </>
                )}
              </div>
            </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

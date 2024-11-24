import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FaRegUser } from "react-icons/fa";
import { IoTimeOutline } from "react-icons/io5";
import Chart from "chart.js/auto";
import { Line } from "react-chartjs-2";

export default function TechAdminDashboardNewRegistration() {
  const [clients, setClients] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [graphData, setGraphData] = useState({});
  const [graphView, setGraphView] = useState("monthly");

  useEffect(() => {
    const fetchClients = async () => {
      const db = getFirestore();
      const clientsRef = collection(db, "clients");
      const querySnapshot = await getDocs(clientsRef);

      const clientsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setClients(clientsData);
      setUserCount(clientsData.length);

      // Count pending approvals
      const pending = clientsData.filter((client) => client.status === "pending");
      setPendingCount(pending.length);

      // Prepare graph data
      prepareGraphData(clientsData, graphView);
    };

    fetchClients();
  }, [graphView]);

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

  return (
    <div className="p-10">
      <h2 className="font-semibold text-4xl mb-4">Sites</h2>
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
            <Line data={graphData} />
          ) : (
            <p>No data available for the selected view.</p>
          )}
        </div>
      </div>
    </div>
  );
}

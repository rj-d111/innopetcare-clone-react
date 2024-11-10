import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { FaUsers, FaEye } from "react-icons/fa";

export default function TechAdminUserReport() {
  const [reports, setReports] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const db = getFirestore();

  // Fetch reports from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      const reportsCollection = collection(db, "send-report");
      const reportsSnapshot = await getDocs(reportsCollection);
      const reportsData = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsData);

      // Calculate total unique users
      const uniqueUsers = new Set(reportsData.map((report) => report.userId));
      setTotalUsers(uniqueUsers.size);
    };

    fetchReports();
  }, []);

  return (
    <div className="p-10 bg-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">User Reports</h1>

      {/* Stats */}
      <div className="stats shadow mb-4">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FaUsers size={30} />
          </div>
          <div className="stat-title">Total Users Responded</div>
          <div className="stat-value text-primary">{totalUsers}</div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              {[
                "Description",
                "Steps",
                "Impact",
                "Environment",
                "Frequency",
                "Data Loss",
                "Performance",
                "Additional Info",
                "Timestamp",
              ].map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 p-2 text-left font-semibold bg-gray-100"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{report.description}</td>
                  <td className="border border-gray-300 p-2">{report.steps}</td>
                  <td className="border border-gray-300 p-2">{report.impact}</td>
                  <td className="border border-gray-300 p-2">{report.environment}</td>
                  <td className="border border-gray-300 p-2">{report.frequency}</td>
                  <td className="border border-gray-300 p-2">{report.dataLoss}</td>
                  <td className="border border-gray-300 p-2">{report.performance}</td>
                  <td className="border border-gray-300 p-2">{report.additionalInfo}</td>
                  <td className="border border-gray-300 p-2">
                    {new Date(report.timestamp?.seconds * 1000).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

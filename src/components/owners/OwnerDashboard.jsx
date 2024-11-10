import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useParams } from "react-router-dom"; // To get projectId from the URL
import { FaRegUser } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { IoCloseCircle, IoTimeOutline } from "react-icons/io5";

export default function OwnerDashboard() {
  const [clients, setClients] = useState([]); // State to store client data
  const [userCount, setUserCount] = useState(0);
  const { id } = useParams(); // Get projectId from the URL

  useEffect(() => {
    const fetchClients = async () => {
      const db = getFirestore();
      const clientsRef = collection(db, "clients");

      // Query to match clients by projectId
      const q = query(clientsRef, where("projectId", "==", id));
      const querySnapshot = await getDocs(q);

      // Map through the results and set client data
      const clientsData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // You can include the document ID if needed
        ...doc.data(),
      }));

      // Update state with the client data
      setClients(clientsData);
      setUserCount(clientsData.length); // Set user count based on fetched data
    };

    if (id) {
      fetchClients();
    }
  }, [id]);

  return (
    <div className="p-6">
      <h2 className="font-semibold text-4xl mb-4">Dashboard</h2>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-figure text-secondary">
            <FaRegUser size={25} />
          </div>
          <div className="stat-title">No. of Registered Users</div>
          <div className="stat-value">{userCount}</div>
        </div>
      </div>
      {/* Table to display clients */}
      <table className="min-w-full border-collapse border border-gray-200 mt-4">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Phone</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Account Created</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="border border-gray-300 p-2">{client.name}</td>
              <td className="border border-gray-300 p-2">{client.email}</td>
              <td className="border border-gray-300 p-2">{client.phone}</td>
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
              <td className="border border-gray-300 p-2">
                {new Date(
                  client.accountCreated.seconds * 1000
                ).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

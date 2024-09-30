import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../../firebase"; // Ensure your Firebase config is imported
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch } from "react-icons/fa";
import {
  doc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
} from "firebase/firestore";

export default function OwnerPending() {
  const { id } = useParams(); // Get projectId from route params
  const [clients, setClients] = useState([]); // Store all client data
  const [filteredClients, setFilteredClients] = useState([]); // Filtered data based on filters and search
  const [filterStatus, setFilterStatus] = useState("all"); // Store filter selection (all, accepted, pending/rejected)
  const [searchQuery, setSearchQuery] = useState(""); // Store search input value

  useEffect(() => {
    // Fetch clients matching the projectId
    const fetchClients = async () => {
      const clientsCollection = collection(db, "clients");
      const q = query(clientsCollection, where("projectId", "==", id));
      const querySnapshot = await getDocs(q);

      const clientsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setClients(clientsData);
      setFilteredClients(clientsData); // Set initial filter
    };

    fetchClients();
  }, [id]);

  // Function to filter clients based on selected status and search query
  useEffect(() => {
    const applyFilters = () => {
      let filtered = clients;

      // Apply search filter
      if (searchQuery.trim() !== "") {
        filtered = filtered.filter((client) =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply status filter
      if (filterStatus === "accepted") {
        filtered = filtered.filter((client) => client.isApproved === true);
      } else if (filterStatus === "pending/rejected") {
        filtered = filtered.filter((client) => client.isApproved !== true);
      }

      setFilteredClients(filtered);
    };

    applyFilters();
  }, [searchQuery, filterStatus, clients]);

  // Handle Accept or Reject actions
  const handleAction = async (clientId, action, clientName) => {
    const clientDocRef = doc(db, "clients", clientId);
    const isApproved = action === "accept";

    try {
      // Update Firestore with the new isApproved status
      await updateDoc(clientDocRef, {
        isApproved: isApproved,
      });

      if (isApproved) {
        toast.success(`${clientName} was successfully approved`);
      } else {
        toast.success(`${clientName} was successfully rejected`);
      }

      // Update local state after change
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === clientId ? { ...client, isApproved } : client
        )
      );
    } catch (error) {
      toast.error("An error occurred while updating client status.");
      console.error("Error updating client status: ", error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>

      <div className="flex justify-between">
        {/* Filter buttons */}
        <div className="join join-vertical lg:join-horizontal mb-5">
          <button className={`btn join-item${filterStatus === "all" && "btn-active"}`} onClick={() => setFilterStatus("all")}>
            All
          </button>
          <button className={`btn join-item ${filterStatus === "accepted" && "btn-active"}`} onClick={() => setFilterStatus("accepted")}>
            Accepted
          </button>
          <button className={`btn join-item ${filterStatus === "pending/rejected" && "btn-active"}`} onClick={() => setFilterStatus("pending/rejected")}>
            Pending/Rejected
          </button>
        </div>

        {/* Search bar */}
        <div className="join">
          <input
            className="input input-bordered join-item w-60"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn join-item rounded-r-full">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Account Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client, index) => (
                <tr key={client.id}>
                  <th>{index + 1}</th>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{client.timestamp?.toDate().toLocaleString()}</td>
                  <td>
                    {client.isApproved ? (
                      <span className="text-green-500">Approved</span>
                    ) : (
                      <span className="text-yellow-500">Pending</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm mr-2  text-white"
                      onClick={() =>
                        handleAction(client.id, "accept", client.name)
                      }
                      disabled={client.isApproved}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-error btn-sm text-white"
                      onClick={() =>
                        handleAction(client.id, "reject", client.name)
                      }
                      disabled={client.isApproved === false}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

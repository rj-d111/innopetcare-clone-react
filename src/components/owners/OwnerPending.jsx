import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../../firebase"; // Ensure your Firebase config is imported
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaSortUp, FaSortDown, FaArchive, FaTimesCircle, FaCheckCircle, FaQuestionCircle } from "react-icons/fa";
import {
  doc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { IoCloseCircle, IoTimeOutline } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa6";

export default function OwnerPending() {
  const { id } = useParams(); // Get projectId from route params
  const [clients, setClients] = useState([]); // Store all client data
  const [filteredClients, setFilteredClients] = useState([]); // Filtered data based on filters and search
  const [filterStatus, setFilterStatus] = useState("all"); // Set "Pending" as the default filter
  const [searchQuery, setSearchQuery] = useState(""); // Store search input value
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    const fetchClients = async () => {
      const clientsCollection = collection(db, "clients");
      const q = query(clientsCollection, where("projectId", "==", id));
      const querySnapshot = await getDocs(q);

      const now = new Date();
      const clientsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const lastActivityTime = data.lastActivityTime?.toDate();
        const isRejected =
          data.isApproved === false &&
          lastActivityTime &&
          now - lastActivityTime > 7 * 24 * 60 * 60 * 1000;

        return {
          ...data,
          id: doc.id,
          isRejected,
        };
      });

      setClients(clientsData);
      setFilteredClients(clientsData); // Set initial filter
    };

    fetchClients();
  }, [id]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = clients;

      // Apply search filter
      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(
          (client) =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply status filter
      if (filterStatus === "approved") {
        filtered = filtered.filter((client) => client.status === "approved");
      } else if (filterStatus === "pending") {
        filtered = filtered.filter((client) => client.status === "pending");
      } else if (filterStatus === "rejected") {
        filtered = filtered.filter((client) => client.status === "rejected");
      }
      else if (filterStatus === "archived") {
        filtered = filtered.filter((client) => client.status === "archived");
      }

      // Apply sorting
      if (sortConfig.key) {
        filtered = [...filtered].sort((a, b) => {
          const aValue = a[sortConfig.key] || "";
          const bValue = b[sortConfig.key] || "";

          if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      setFilteredClients(filtered);
    };

    applyFilters();
  }, [searchQuery, filterStatus, clients, sortConfig]);

  // Handle Accept or Reject actions
 // Handle Accept or Reject actions
const handleAction = async (clientId, action, clientName) => {
  const clientDocRef = doc(db, "clients", clientId);
  const status = action === "accept" ? "approved" : "rejected";

  try {
    // Update the status in Firestore
    await updateDoc(clientDocRef, {
      status,
    });

    toast.success(
      `${clientName} was successfully ${status === "approved" ? "approved" : "rejected"}`
    );

    // Update the local state to reflect the changes
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === clientId ? { ...client, status } : client
      )
    );
  } catch (error) {
    toast.error("An error occurred while updating client status.");
    console.error("Error updating client status: ", error);
  }
};


  // Sort handler
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Pagination
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const getAccountStatus = (lastActivityTime, userStatus) => {
    if (!lastActivityTime) return "";

    if (userStatus === "archived") return "";

    const lastActiveDate = lastActivityTime.toDate();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return lastActiveDate > oneYearAgo ? "active" : "inactive";
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Requests</h2>

      <div className="flex justify-between">
        {/* Filter buttons */}
        <div className="join join-vertical lg:join-horizontal mb-5">
          <button
            className={`btn join-item ${
              filterStatus === "all" && "btn-active"
            }`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`btn join-item ${
              filterStatus === "accepted" && "btn-active"
            }`}
            onClick={() => setFilterStatus("accepted")}
          >
            Accepted
          </button>
          <button
            className={`btn join-item ${
              filterStatus === "pending" && "btn-active"
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`btn join-item ${
              filterStatus === "rejected" && "btn-active"
            }`}
            onClick={() => setFilterStatus("rejected")}
          >
            Rejected
          </button>
          <button
            className={`btn join-item ${
              filterStatus === "archived" && "btn-active"
            }`}
            onClick={() => setFilterStatus("archived")}
          >
            Archived
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

<div className="overflow-x-auto">
  <table className="table w-full">
    <thead>
      <tr>
        <th>#</th>
        {[
          "Name",
          "Email",
          "Phone",
          "Account Created",
          "Last Login Time",
        ].map((field) => (
          <th key={field} onClick={() => handleSort(field)}>
            <div className="cursor-pointer flex items-center gap-1">
              {field}
              {sortConfig.key === field ? (
                sortConfig.direction === "asc" ? (
                  <FaSortUp />
                ) : (
                  <FaSortDown />
                )
              ) : null}
            </div>
          </th>
        ))}
        <th>Account Status</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {paginatedClients.length > 0 ? (
        paginatedClients.map((client, index) => {
          // Define accountStatus here
          const accountStatus = getAccountStatus(
            client.lastActivityTime,
            client.status
          );

          return (
            <tr key={client.id}>
              <th>{index + 1 + (currentPage - 1) * itemsPerPage}</th>
              <td>{client.name}</td>
              <td>{client.email}</td>
              <td>{client.phone}</td>
              <td>{client.accountCreated?.toDate().toLocaleString()}</td>
              <td>
                {client.lastActivityTime
                  ? client.lastActivityTime.toDate().toLocaleString()
                  : "N/A"}
              </td>

              {/* Account Status Column */}
              <td>
                {accountStatus === "active" ? (
                  <div className="flex items-center text-green-500">
                    <FaCheckCircle className="mr-2" /> Active
                  </div>
                ) : accountStatus === "inactive" ? (
                  <div className="flex items-center text-red-500">
                    <FaTimesCircle className="mr-2" /> Inactive
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <FaQuestionCircle className="mr-2" /> N/A
                  </div>
                )}
              </td>

              {/* Status Column */}
              <td>
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
                  ) : client.status === "rejected" ? (
                    <>
                      <IoCloseCircle className="text-red-500" size={20} />
                      <div className="text-red-500">Rejected</div>
                    </>
                  ) : client.status === "archived" ? (
                    <>
                      <FaArchive className="text-orange-500" size={20} />
                      <div className="text-orange-500">Archived</div>
                    </>
                  ) : (
                    <div className="text-gray-500">N/A</div>
                  )}
                </div>
              </td>

              {/* Action Buttons */}
              <td>
                <button
                  className="btn btn-success btn-sm mr-2 text-white"
                  onClick={() => handleAction(client.id, "accept", client.name)}
                  disabled={client.status === "approved"}
                >
                  Accept
                </button>
                <button
                  className="btn btn-error btn-sm text-white"
                  onClick={() => handleAction(client.id, "reject", client.name)}
                  disabled={
                    client.status === "approved" || client.status === "rejected"
                  }
                >
                  Reject
                </button>
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="8" className="text-center">
            No clients found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`btn btn-sm ${
              currentPage === index + 1 ? "btn-active" : ""
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

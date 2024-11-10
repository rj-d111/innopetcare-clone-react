import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaRegEye, FaSortUp, FaSortDown } from "react-icons/fa";
import { IoCloseCircle, IoTimeOutline } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { doc, getDocs, updateDoc, collection, query } from "firebase/firestore";

export default function TechAdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const usersData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Apply filters based on search query and status
  useEffect(() => {
    const applyFilters = () => {
      let filtered = users;
  
      // Apply search filter
      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
  
      // Apply status filter
      if (filterStatus !== "all") {
        filtered = filtered.filter((user) => user.status === filterStatus);
      }
  
      setFilteredUsers(filtered);
    };
  
    applyFilters();
  }, [searchQuery, filterStatus, users]);
  
  // Function to handle user approval or rejection
  const handleAction = async (userId, action, userName) => {
    const userDocRef = doc(db, "users", userId);
    const newStatus = action === "accept" ? "approved" : "rejected";

    try {
      await updateDoc(userDocRef, { status: newStatus });

      toast.success(
        `${userName} was successfully ${newStatus === "approved" ? "approved" : "rejected"}`
      );

      // Update the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      toast.error("An error occurred while updating user status.");
      console.error("Error updating user status: ", error);
    }
  };

  // Sorting logic
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));

    setFilteredUsers((prevUsers) => {
      return [...prevUsers].sort((a, b) => {
        const aValue = a[key] || "";
        const bValue = b[key] || "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    });
  };

  // Pagination logic
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tech Admin Users</h2>
  
      {/* Filter Buttons */}
      <div className="flex justify-between mb-5">
        <div className="join join-vertical lg:join-horizontal">
          <button
            className={`btn join-item ${filterStatus === "all" && "btn-active"}`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`btn join-item ${
              filterStatus === "approved" && "btn-active"
            }`}
            onClick={() => setFilterStatus("approved")}
          >
            Approved
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
              filterStatus === "deleted" && "btn-active"
            }`}
            onClick={() => setFilterStatus("deleted")}
          >
            Deleted
          </button>
        </div>
  
        {/* Search Bar */}
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
  
      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              {["Name", "Email", "Phone", "Last Activity Time"].map((field) => (
                <th key={field} onClick={() => handleSort(field)}>
                  <div
                    className={`cursor-pointer flex items-center gap-1 ${
                      sortConfig.key === field ? "font-semibold text-black" : ""
                    }`}
                  >
                    {field}
                    {sortConfig.key === field ? (
                      sortConfig.direction === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      )
                    ) : (
                      <FaSortUp />
                    )}
                  </div>
                </th>
              ))}
              <th>Status</th>
              <th>View Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <tr key={user.id}>
                  <th>{index + 1 + (currentPage - 1) * itemsPerPage}</th>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>
                    {user.lastActivityTime
                      ? user.lastActivityTime.toDate().toLocaleString()
                      : "N/A"}
                  </td>
                  {/* Status Column with Icons */}
                  <td>
                    <div className="flex flex-col items-center">
                      {user.status === "approved" ? (
                        <>
                          <FaCircleCheck className="text-green-500" size={20} />
                          <div className="text-green-500">Approved</div>
                        </>
                      ) : user.status === "pending" ? (
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
                  <td>
                    <Link to={`/admin/users/${user.id}`}>
                      <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-700">
                        <FaRegEye /> <span>View</span>
                      </button>
                    </Link>
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm mr-2 text-white"
                      onClick={() => handleAction(user.id, "accept", user.name)}
                      disabled={user.status === "approved"}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-error btn-sm text-white"
                      onClick={() => handleAction(user.id, "reject", user.name)}
                      disabled={user.status === "rejected" || user.status === "approved"}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No users found
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
            onClick={() => setCurrentPage(index + 1)}
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

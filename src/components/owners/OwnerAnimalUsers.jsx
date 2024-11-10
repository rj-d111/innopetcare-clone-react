import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Ensure Firebase config is imported
import { FaSearch, FaSortUp, FaSortDown } from "react-icons/fa";
import { useParams } from "react-router";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function OwnerAnimalUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const usersPerPage = 100;
  const { id } = useParams();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "clients");
        const q = query(usersCollection, where("projectId", "==", id));
        const querySnapshot = await getDocs(q);

        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [id]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = users;

      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (sortConfig.key) {
        filtered = filtered.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }

      setFilteredUsers(filtered);
    };

    applyFilters();
  }, [searchQuery, users, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Animal Shelter Users</h2>

      <div className="join mb-5">
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

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th onClick={() => handleSort("name")}>
                <div className="cursor-pointer flex items-center gap-1">
                  Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    ))}
                </div>
              </th>
              <th onClick={() => handleSort("email")}>
                <div className="cursor-pointer flex items-center gap-1">
                  Email{" "}
                  {sortConfig.key === "email" &&
                    (sortConfig.direction === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    ))}
                </div>
              </th>
              <th onClick={() => handleSort("phone")}>
                <div className="cursor-pointer flex items-center gap-1">
                  Phone
                  {sortConfig.key === "phone" &&
                    (sortConfig.direction === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    ))}
                </div>
              </th>
              <th onClick={() => handleSort("accountCreated")}>
                <div className="cursor-pointer flex items-center gap-1">
                  Account Created{" "}
                  {sortConfig.key === "accountCreated" &&
                    (sortConfig.direction === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    ))}
                </div>
              </th>
              <th onClick={() => handleSort("lastActivityTime")}>
                <div className="cursor-pointer flex items-center gap-1">
                  Last Login{" "}
                  {sortConfig.key === "lastActivityTime" &&
                    (sortConfig.direction === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr key={user.id}>
                  <th>{indexOfFirstUser + index + 1}</th>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.accountCreated?.toDate().toLocaleString()}</td>
                  <td>
                    {user.lastActivityTime
                      ? user.lastActivityTime.toDate().toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          className="btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

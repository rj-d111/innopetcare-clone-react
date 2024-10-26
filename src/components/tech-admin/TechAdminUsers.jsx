import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaRegEye } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { doc, getDocs, updateDoc, collection, query, where, addDoc, serverTimestamp } from "firebase/firestore";

export default function TechAdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);

      const usersData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setUsers(usersData);
      setFilteredUsers(usersData);
    };

    fetchUsers();
  }, []);

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

      if (filterStatus === "accepted") {
        filtered = filtered.filter((user) => user.isApproved === true);
      } else if (filterStatus === "pending/rejected") {
        filtered = filtered.filter((user) => user.isApproved !== true);
      }

      setFilteredUsers(filtered);
    };

    applyFilters();
  }, [searchQuery, filterStatus, users]);

  const handleAction = async (userId, action, userName) => {
    const userDocRef = doc(db, "users", userId);
    const isApproved = action === "accept";

    try {
      await updateDoc(userDocRef, {
        isApproved: isApproved,
      });

      toast.success(
        `${userName} was successfully ${isApproved ? "approved" : "rejected"}`
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isApproved } : user
        )
      );

      if (isApproved) {
        await createProject(userId, userName); // Create project if accepted
      }
    } catch (error) {
      toast.error("An error occurred while updating user status.");
      console.error("Error updating user status: ", error);
    }
  };

  const createProject = async (userId, userName) => {
    try {
      const projectsRef = collection(db, "projects");

      const projectData = {
        createdAt: serverTimestamp(),
        name: userName, // Use userName for project name
        status: "pending",
        type: userName.includes("Veterinary") ? "Veterinary Site" : "Animal Shelter Site",
        userId: userId, // Use user ID to associate the project with the user
      };

      const q = query(projectsRef, where("name", "==", projectData.name));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(projectsRef, projectData);
        toast.success(
          `Your ${projectData.type} Project "${projectData.name}" created successfully!`
        );
      } else {
        toast.info(`Your project "${projectData.name}" already exists!`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Error creating project.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Users</h2>

      <div className="flex justify-between mb-5">
        <div className="join join-vertical lg:join-horizontal">
          <button
            className={`btn join-item ${filterStatus === "all" && "btn-active"}`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            className={`btn join-item ${filterStatus === "accepted" && "btn-active"}`}
            onClick={() => setFilterStatus("accepted")}
          >
            Accepted
          </button>
          <button
            className={`btn join-item ${filterStatus === "pending/rejected" && "btn-active"}`}
            onClick={() => setFilterStatus("pending/rejected")}
          >
            Pending/Rejected
          </button>
        </div>

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
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Approved</th>
              <th>View Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <th>{index + 1}</th>
                  <td>{user.name.split(" ")[0]}</td>
                  <td>{user.name.split(" ")[1] || ""}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td className="text-center">
                    {user.isApproved ? (
                      <FaCircleCheck className="text-green-500" size={30} />
                    ) : (
                      <IoCloseCircle className="text-red-500" size={30} />
                    )}
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
                      disabled={user.isApproved}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-error btn-sm text-white"
                      onClick={() => handleAction(user.id, "reject", user.name)}
                      disabled={user.isApproved === false}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

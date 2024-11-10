import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getFirestore,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { FaCheckCircle, FaEye, FaSearch, FaSortDown, FaSortUp } from "react-icons/fa";
import { IoCloseCircle, IoTimeOutline } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa";
import { useNavigate } from "react-router";

export default function TechAdminAdditional() {
  const db = getFirestore();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch users to map client IDs to names
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.reduce((acc, doc) => {
        const userId = doc.data().uid;
        const userName = doc.data().name;
        acc[userId] = userName;
        return acc;
      }, {});
      setUsersMap(usersData);

      // Fetch projects with isAdditionalProject == true
      const projectsCollection = collection(db, "projects");
      const querySnapshot = await getDocs(projectsCollection);
      const projectsData = querySnapshot.docs
        .filter(doc => doc.data().isAdditionalProject === true)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          clientName: usersData[doc.data().clientId] || "Unknown Client",
        }));

      setProjects(projectsData);
      setFilteredProjects(projectsData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [filterStatus, sortConfig, searchQuery, projects]);

  const filterAndSortProjects = () => {
    let updatedProjects = [...projects];

    // Filter by status
    if (filterStatus === "pending") {
      updatedProjects = updatedProjects.filter(
        (project) => project.isApproved === false && !project.isRejected
      );
    } else if (filterStatus === "accepted") {
      updatedProjects = updatedProjects.filter((project) => project.isApproved);
    } else if (filterStatus === "rejected") {
      updatedProjects = updatedProjects.filter((project) => project.isRejected);
    }

    // Apply search query
    if (searchQuery) {
      updatedProjects = updatedProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort projects
    if (sortConfig.key) {
      updatedProjects.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredProjects(updatedProjects);
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const handleApproval = async (projectId, isApproved) => {
    const projectRef = doc(db, "projects", projectId);
    const project = projects.find((proj) => proj.id === projectId);

    await updateDoc(projectRef, {
      isApproved,
      isRejected: !isApproved,
      updatedAt: serverTimestamp(),
    });

    // Add notification
    const notificationsRef = collection(
      db,
      "notifications",
      project.clientId,
      "notifications"
    );
    await addDoc(notificationsRef, {
      clientId: project.clientId,
      type: "project",
      read: false,
      timestamp: serverTimestamp(),
      text: `Your additional project ${project.name} has been ${
        isApproved ? "approved" : "rejected"
      }.`,
    });

    setProjects((prevProjects) =>
      prevProjects.map((proj) =>
        proj.id === projectId
          ? { ...proj, isApproved, isRejected: !isApproved }
          : proj
      )
    );

    toast.success(
      `${project.name} successfully ${isApproved ? "accepted" : "rejected"}`
    );
  };

 return (
  <div className="p-10 bg-white max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold mb-4">Additional Pending Projects</h1>

    {/* Filters */}
    <div className="flex flex-col lg:flex-row justify-between items-center mb-5 space-y-4 lg:space-y-0">
      <div className="join join-vertical lg:join-horizontal">
        {["all", "Veterinary Admin", "Animal Shelter Admin"].map((type) => (
          <button
            key={type}
            className={`btn join-item ${filterType === type ? "btn-active" : ""}`}
            onClick={() => setFilterType(type)}
          >
            {type === "all" ? "All" : type}
          </button>
        ))}
      </div>

      <div role="tablist" className="tabs tabs-boxed">
        {["all", "pending", "accepted", "rejected"].map((status) => (
          <button
            key={status}
            role="tab"
            className={`tab ${filterStatus === status ? "tab-active" : ""}`}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="join">
        <input
          className="input input-bordered join-item w-60"
          placeholder="Search by project or client name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn join-item rounded-r-full">
          <FaSearch />
        </button>
      </div>
    </div>

    {/* Projects Table */}
    <div className="overflow-x-auto">
      <table className="min-w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr>
            {["name", "typeOfAdmin", "clientName", "createdAt", "status"].map(
              (field) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`border border-gray-300 p-2 cursor-pointer ${
                    sortConfig.key === field ? "font-bold text-black" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {field === "name" ? "Project Name" : field}
                    {sortConfig.key === field ? (
                      sortConfig.direction === "asc" ? (
                        <FaSortUp className="ml-1" />
                      ) : (
                        <FaSortDown className="ml-1" />
                      )
                    ) : (
                      <FaSortUp className="ml-1 opacity-50" />
                    )}
                  </div>
                </th>
              )
            )}
            <th className="border border-gray-300 p-2">View</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{project.legalName}</td>
                <td className="border border-gray-300 p-2">{project.typeOfAdmin}</td>
                <td className="border border-gray-300 p-2">{project.clientName}</td>
                <td className="border border-gray-300 p-2">
                  {project.createdAt?.toDate().toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {project.isApproved ? (
                    <FaCheckCircle className="text-green-500" />
                  ) : project.isRejected ? (
                    <IoCloseCircle className="text-red-500" />
                  ) : (
                    <IoTimeOutline className="text-yellow-500" />
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => navigate(`${project.id}`)}
                    className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
                  >
                    <FaEye /> <span>View Details</span>
                  </button>
                </td>
                <td className="border border-gray-300 p-2">
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleApproval(project.id, true)}
                      disabled={project.isApproved}
                      className={`btn btn-sm ${
                        project.isApproved
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleApproval(project.id, false)}
                      disabled={project.isRejected || project.isApproved}
                      className={`btn btn-sm ${
                        project.isRejected || project.isApproved
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="border border-gray-300 p-2 text-center">
                No projects found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

}

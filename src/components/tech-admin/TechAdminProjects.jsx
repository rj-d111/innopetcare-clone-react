import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { FaSearch, FaSortUp, FaSortDown } from "react-icons/fa";

export default function TechAdminProjects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();

      // Fetch users
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Create a map of users for quick access
      const usersMap = {};
      usersData.forEach((user) => {
        usersMap[user.id] = user.name;
      });
      setUsersMap(usersMap);

      // Fetch projects
      const projectsCollection = collection(db, "projects");
      const projectsSnapshot = await getDocs(projectsCollection);
      const projectsData = projectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Map projects to include user names
      const projectsWithUsers = projectsData.map((project) => ({
        ...project,
        userName: usersMap[project.userId] || "Unknown User",
      }));

      setProjects(projectsWithUsers);
      setFilteredProjects(projectsWithUsers); // Initialize filtered projects
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter projects based on search query, filterType, and filterStatus
    const filtered = projects.filter((project) => {
      const matchesType = filterType === "all" || project.type === filterType;
      const matchesStatus =
        filterStatus === "all" || project.status === filterStatus;
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.userName &&
          project.userName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesStatus && matchesSearch;
    });

    setFilteredProjects(filtered);
  }, [filterType, filterStatus, searchQuery, projects]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
    const sortedProjects = [...filteredProjects].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredProjects(sortedProjects);
  };

  return (
    <div className="p-10 bg-white max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Projects</h1>
      <div className="flex justify-between items-center mb-5">
        {/* Filter buttons for Project Type */}
        <div className="join join-vertical lg:join-horizontal">
          <button
            className={`btn join-item ${
              filterType === "all" ? "btn-active" : ""
            }`}
            onClick={() => setFilterType("all")}
          >
            All
          </button>
          <button
            className={`btn join-item ${
              filterType === "Veterinary Site" ? "btn-active" : ""
            }`}
            onClick={() => setFilterType("Veterinary Site")}
          >
            Veterinary Site
          </button>
          <button
            className={`btn join-item ${
              filterType === "Animal Shelter Site" ? "btn-active" : ""
            }`}
            onClick={() => setFilterType("Animal Shelter Site")}
          >
            Animal Shelter Site
          </button>
        </div>

        {/* Tab list for Project Status */}
        <div role="tablist" className="tabs tabs-boxed">
          <button
            role="tab"
            className={`tab ${filterStatus === "all" ? "tab-active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All
          </button>
          <button
            role="tab"
            className={`tab ${filterStatus === "pending" ? "tab-active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            role="tab"
            className={`tab ${filterStatus === "active" ? "tab-active" : ""}`}
            onClick={() => setFilterStatus("active")}
          >
            Active
          </button>
          <button
            role="tab"
            className={`tab ${filterStatus === "disabled" ? "tab-active" : ""}`}
            onClick={() => setFilterStatus("disabled")}
          >
            Disabled
          </button>
        </div>

        {/* Search Bar */}
        <div className="join">
          <input
            className="input input-bordered join-item w-60"
            placeholder="Search by name or user"
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
        <table className="table w-full">
          <thead>
            <tr>
              {["name", "createdAt", "status", "type", "userName"].map(
                (field, index) => (
                  <th
                    key={index}
                    onClick={() => handleSort(field)}
                    className={` p-2 cursor-pointer ${
                      sortConfig.key === field ? "font-bold text-black" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      {field.charAt(0).toUpperCase() +
                        field.slice(1).replace(/([A-Z])/g, " $1")}
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
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-100">
                  <td>{project.name}</td>
                  <td>
                    {project.createdAt?.toDate().toLocaleString()}
                  </td>
                  <td>
                    {project.status}
                  </td>
                  <td>{project.type}</td>
                  <td>
                    {project.userName}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center"
                >
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

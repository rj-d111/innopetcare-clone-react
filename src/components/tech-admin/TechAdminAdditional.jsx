import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc,
  query,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaEye,
  FaRegEye,
  FaSearch,
  FaSortDown,
  FaSortUp,
} from "react-icons/fa";
import { IoCloseCircle, IoTimeOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { FaCircleCheck } from "react-icons/fa6";

export default function TechAdminAdditional() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterType, setFilterType] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [userName, setUserName] = useState("N/A");
  const navigate = useNavigate();
  const refreshProjects = async () => {
    try {
      const projectsCollection = collection(db, "projects-waiting");
      const querySnapshot = await getDocs(projectsCollection);
      const updatedProjects = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProjects(updatedProjects);
      setFilteredProjects(updatedProjects); // Reapply filters
    } catch (error) {
      console.error("Error refreshing projects:", error);
    }
  };

  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsCollection = collection(db, "projects-waiting");
        const querySnapshot = await getDocs(projectsCollection);

        const projectsData = await Promise.all(
          querySnapshot.docs.map(async (projectDoc) => {
            const project = { ...projectDoc.data(), id: projectDoc.id };

            // Fetch user's name using the foreign key (userId)
            if (project.userId) {
              try {
                const userDocRef = doc(db, "users", project.userId);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                  project.userName = userDocSnapshot.data().name || "N/A";
                } else {
                  project.userName = "N/A";
                }
              } catch (error) {
                console.error("Error fetching user:", error);
                project.userName = "N/A";
              }
            } else {
              project.userName = "N/A";
            }
            return project;
          })
        );

        setProjects(projectsData);
        setFilteredProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);
  // Apply filters
  useEffect(() => {
    const filterProjects = () => {
      let filtered = [...projects];

      // Apply search filter
      if (searchQuery.trim() !== "") {
        filtered = filtered.filter(
          (project) =>
            project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply type filter
      if (filterType !== "all") {
        filtered = filtered.filter((project) => project.type === filterType);
      }

      // Apply status filter
      if (filterStatus !== "all") {
        filtered = filtered.filter((project) => {
          console.log("Checking status:", project.status); // Debugging line
          return project.status === filterStatus;
        });
      }

      setFilteredProjects(filtered);
    };

    filterProjects();
  }, [searchQuery, filterStatus, filterType, projects]);

  // Handle sorting
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProjects(sortedProjects);
  };

  // Handle accept or reject action
  const handleAction = async (projectId, actionType, project) => {
    console.log("Action:", actionType, "Project ID:", projectId);
    console.log("Project Data:", project);

    if (!projectId || !project) {
      toast.error("Project data is missing.");
      return;
    }

    if (actionType === "accept") {
      await handleSubmit(projectId, project);
    } else if (actionType === "reject") {
      await handleReject(projectId, project);
    }

    // Update the local state after accepting/rejecting
    refreshProjects();
  };

  // Function for accepting projects
  const handleSubmit = async (projectId, projectData) => {
    try {
      if (!projectData.userId || !projectData.name) {
        throw new Error("Invalid project data");
      }
  
      // Step 1: Check for duplicates in the "projects" collection
      const projectsRef = collection(db, "projects");
      const q = query(
        projectsRef,
        where("userId", "==", projectData.userId),
        where("name", "==", projectData.name)
      );
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        toast.info(`Project "${projectData.name}" already exists.`);
        return;
      }
  
      // Step 2: Remove the `id` attribute from projectData before saving
      const { id, ...dataToSave } = projectData;
  
      // Step 3: Upload project data to the "/projects/{projectId}" collection
      const projectDocRef = doc(db, "projects", projectId);
      await setDoc(projectDocRef, {
        ...dataToSave,
        createdAt: serverTimestamp(),
      });
  
      // Step 4: Create a notification for the user
      if (projectData.userId) {
        const notificationRef = collection(
          db,
          `notifications/${projectData.userId}/notifications`
        );
        await addDoc(notificationRef, {
          message: `Your project "${projectData.name}" has been accepted.`,
          read: false,
          timestamp: serverTimestamp(),
          type: "project",
        });
      }
  
      // Step 5: Update the project status in "projects-waiting" to "approved"
      const projectWaitingRef = doc(db, "projects-waiting", projectId);
      await updateDoc(projectWaitingRef, {
        status: "approved",
        updatedAt: serverTimestamp(),
      });
  
      toast.success(`Project "${projectData.name}" accepted successfully!`);
    } catch (error) {
      console.error("Error accepting project:", error);
      toast.error("Failed to accept the project. Please try again.");
    }
  };
  

  // Function for rejecting projects
  const handleReject = async (projectId, projectData) => {
    try {
      console.log("Rejecting Project ID:", projectId);
      console.log("Project Data:", projectData);

      if (!projectId) {
        throw new Error("Project ID is missing");
      }

      // Update the project status in "projects-waiting" to "rejected"
      const projectWaitingRef = doc(db, "projects-waiting", projectId);
      await updateDoc(projectWaitingRef, {
        status: "rejected",
      });

      // Create a notification for the user
      if (projectData.userId) {
        const notificationRef = collection(
          db,
          `notifications/${projectData.userId}/notifications`
        );
        await addDoc(notificationRef, {
          message: `Your project "${projectData.name}" has been rejected.`,
          read: false,
          timestamp: serverTimestamp(),
          type: "project",
        });
      }

      toast.success(`Project "${projectData.name}" has been rejected.`);
    } catch (error) {
      console.error("Error rejecting project:", error);
      toast.error("Failed to reject the project. Please try again.");
    }
  };

  return (
    <div className="p-10 bg-white max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Additional Pending Projects</h1>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-5 space-y-4 lg:space-y-0">
        {/* Type Filter */}
        <div className="join join-vertical lg:join-horizontal">
          {["all", "Veterinary Site", "Animal Shelter Site"].map((type) => (
            <button
              key={type}
              className={`btn join-item ${
                filterType === type ? "btn-active" : ""
              }`}
              onClick={() => setFilterType(type)}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="tabs tabs-boxed">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
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
            placeholder="Search by project name or client ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn join-item">
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              {["name", "type", "User Name", "createdAt"].map((field) => (
                <th key={field} onClick={() => handleSort(field)}>
                  <div className="cursor-pointer flex items-center gap-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {sortConfig.key === field &&
                      (sortConfig.direction === "asc" ? (
                        <FaSortUp />
                      ) : (
                        <FaSortDown />
                      ))}
                  </div>
                </th>
              ))}
              <th>Status</th>
              <th>View Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project, index) => (
                <tr key={project.id}>
                  <td>{index + 1}</td>
                  <td>{project.name}</td>
                  <td>{project.type}</td>
                  <td>{project.userName}</td>
                  <td>{project.createdAt?.toDate().toLocaleString()}</td>
                  <td>
                    <Link to={`${project.id}`}>
                      <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-700">
                        <FaRegEye /> <span>View</span>
                      </button>
                    </Link>
                  </td>
                  <td>
                    <div className="flex flex-col items-center">
                      {project.status === "approved" ? (
                        <>
                          <FaCircleCheck className="text-green-500" size={20} />
                          <div className="text-green-500">Approved</div>
                        </>
                      ) : project.status === "pending" ? (
                        <>
                          <IoTimeOutline
                            className="text-yellow-500"
                            size={20}
                          />
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
                    {/* Accept Button */}
                    <button
                      className="btn btn-success btn-sm mr-2 text-white"
                      onClick={() =>
                        handleAction(project.id, "accept", project)
                      }
                      disabled={project.status === "approved"}
                    >
                      Accept
                    </button>

                    {/* Reject Button */}
                    <button
                      className="btn btn-error btn-sm text-white"
                      onClick={() =>
                        handleAction(project.id, "reject", project)
                      }
                      disabled={
                        project.status === "rejected" ||
                        project.status === "approved"
                      }
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
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

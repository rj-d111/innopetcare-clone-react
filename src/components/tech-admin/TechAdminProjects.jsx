import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export default function TechAdminProjects() {
  const [projects, setProjects] = useState([]);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();

      // Fetch users
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Create a map of users for quick access
      const usersMap = {};
      usersData.forEach(user => {
        usersMap[user.id] = user.name;
      });
      setUsersMap(usersMap);

      // Fetch projects
      const projectsCollection = collection(db, 'projects');
      const projectsSnapshot = await getDocs(projectsCollection);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Map projects to include user names
      const projectsWithUsers = projectsData.map(project => ({
        ...project,
        userName: usersMap[project.userId] || 'Unknown User', // Use 'Unknown User' if user not found
      }));

      setProjects(projectsWithUsers);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="p-10">
        <h1 className="text-3xl font-bold">Projects</h1>
        <table className="min-w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Project Name</th>
              <th className="border border-gray-300 p-2">Created At</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Type</th>
              <th className="border border-gray-300 p-2">User</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map(project => (
                <tr key={project.id}>
                  <td className="border border-gray-300 p-2">{project.name}</td>
                  <td className="border border-gray-300 p-2">{project.createdAt?.toDate().toLocaleString()}</td>
                  <td className="border border-gray-300 p-2">{project.status}</td>
                  <td className="border border-gray-300 p-2">{project.type}</td>
                  <td className="border border-gray-300 p-2">{project.userName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="border border-gray-300 p-2 text-center">No projects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

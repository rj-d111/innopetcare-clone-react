import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

export default function TechAdminDashboard() {
  const [userCounts, setUserCounts] = useState({ labels: [], data: [] });
  const [projectCounts, setProjectCounts] = useState({ labels: [], data: [] });
  const [timePeriod, setTimePeriod] = useState('monthly'); // monthly by default

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const projectsSnapshot = await getDocs(collection(db, 'projects'));

      // Process user data
      const userTimestamps = usersSnapshot.docs.map(doc => doc.data().timestamp.toDate());
      const userCountMap = processCounts(userTimestamps);
      setUserCounts(userCountMap);

      // Process project data
      const projectTimestamps = projectsSnapshot.docs.map(doc => doc.data().createdAt.toDate());
      const projectCountMap = processCounts(projectTimestamps);
      setProjectCounts(projectCountMap);
    };

    fetchData();
  }, []);

  const processCounts = (timestamps) => {
    const counts = {};
    timestamps.forEach(timestamp => {
      const date = timePeriod === 'monthly' ? `${timestamp.getFullYear()}-${timestamp.getMonth() + 1}` : `${timestamp.getFullYear()}-${Math.floor(timestamp.getDate() / 7) + 1}`;
      counts[date] = (counts[date] || 0) + 1;
    });

    // Prepare data for the chart
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    return { labels, data };
  };

  const handlePeriodChange = (e) => {
    setTimePeriod(e.target.value);
    // Optionally, re-fetch data to adjust counts based on new period
  };

  const userData = {
    labels: userCounts.labels,
    datasets: [
      {
        label: 'No. of Users',
        data: userCounts.data,
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const projectData = {
    labels: projectCounts.labels,
    datasets: [
      {
        label: 'No. of Projects',
        data: projectCounts.data,
        fill: false,
        backgroundColor: 'rgba(153, 102, 255)',
        borderColor: 'rgba(153, 102, 255, 0.2)',
      },
    ],
  };

  // Calculate total counts safely
  const totalUsers = userCounts.data && userCounts.data.length > 0 ? userCounts.data.reduce((a, b) => a + b, 0) : 0;
  const totalProjects = projectCounts.data && projectCounts.data.length > 0 ? projectCounts.data.reduce((a, b) => a + b, 0) : 0;

  return (
    <div className='p-10'>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <label htmlFor="time-period" className="mr-2">Time Period:</label>
          <select id="time-period" value={timePeriod} onChange={handlePeriodChange}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="flex flex-col">
          <span>No. of users: {totalUsers}</span>
          <span>No. of projects: {totalProjects}</span>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className="card">
          <Line data={userData} />
        </div>
        <div className="card">
          <Line data={projectData} />
        </div>
      </div>
    </div>
  );
}

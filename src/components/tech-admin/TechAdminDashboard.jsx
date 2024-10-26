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
import { FaRegUser } from "react-icons/fa";


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

      // Process user data with safety checks for 'timestamp'
      const userTimestamps = usersSnapshot.docs
        .map(doc => doc.data().timestamp)
        .filter(timestamp => timestamp) // Remove undefined values
        .map(timestamp => timestamp.toDate()); // Convert to Date objects
      const userCountMap = processCounts(userTimestamps);
      setUserCounts(userCountMap);

      // Process project data with safety checks for 'createdAt'
      const projectTimestamps = projectsSnapshot.docs
        .map(doc => doc.data().createdAt)
        .filter(createdAt => createdAt) // Remove undefined values
        .map(createdAt => createdAt.toDate()); // Convert to Date objects
      const projectCountMap = processCounts(projectTimestamps);
      setProjectCounts(projectCountMap);
    };

    fetchData();
  }, [timePeriod]);

  const processCounts = (timestamps) => {
    const counts = {};
    timestamps.forEach(timestamp => {
      const date = timePeriod === 'monthly' 
        ? `${timestamp.getFullYear()}-${timestamp.getMonth() + 1}` 
        : `${timestamp.getFullYear()}-W${Math.floor(timestamp.getDate() / 7) + 1}`;
      counts[date] = (counts[date] || 0) + 1;
    });

    // Prepare data for the chart
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    return { labels, data };
  };

  const handlePeriodChange = (e) => {
    setTimePeriod(e.target.value);
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
  const totalUsers = userCounts.data && userCounts.data.length > 0 
    ? userCounts.data.reduce((a, b) => a + b, 0) 
    : 0;
  const totalProjects = projectCounts.data && projectCounts.data.length > 0 
    ? projectCounts.data.reduce((a, b) => a + b, 0) 
    : 0;

  return (
    <div className='p-10'>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div class="stats shadow">

  <div class="stat">
    <div class="stat-figure text-secondary">
     < FaRegUser size={25}/>
    </div>
    <div class="stat-title">No. of Users</div>
    <div class="stat-value">{totalUsers}</div>
  </div>

  <div class="stat">
    <div class="stat-figure text-secondary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="inline-block h-8 w-8 stroke-current">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
      </svg>
    </div>
    <div class="stat-title">No. of Projects</div>
    <div class="stat-value">{totalProjects}</div>
  </div>
</div>

    {/* Time Period */}
      <div className="flex justify-between my-4">
        <div className="flex items-center">
          <label htmlFor="time-period" className="mr-2">Time Period:</label>
          <select id="time-period" value={timePeriod} onChange={handlePeriodChange}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
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

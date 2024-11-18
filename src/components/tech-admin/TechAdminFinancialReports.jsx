import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const exchangeRate = 56; // 1 USD = 56 PHP

export default function TechAdminFinancialReports() {
  // Dummy data for the bar graph
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Revenue (in PHP)',
        data: [12000, 15000, 8000, 18000, 22000, 17000].map(value => value * exchangeRate),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
    };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Financial Report (Monthly Revenue)',
      },
    },
  };

  return (
    <div className="p-10 bg-white max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Financial Report</h1>

      {/* Bar Graph */}
      <div className="mb-10">
        <Bar data={data} options={options} />
      </div>

      {/* Coming Soon Message */}
      <div className="text-center text-gray-500 text-xl mt-8">
        More financial insights coming soon...
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { FaUsers, FaStar } from "react-icons/fa";

export default function TechAdminFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Fetch feedback data from Firestore
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const feedbackCollection = collection(db, "user-feedback-cms");
        const querySnapshot = await getDocs(feedbackCollection);
        const feedbackData = querySnapshot.docs.map((doc) => doc.data());

        setFeedbackList(feedbackData);

        // Calculate total users and average rating
        const total = feedbackData.length;
        const average =
          feedbackData.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
          (total || 1);

        setTotalUsers(total);
        setAverageRating(average);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  // Function to render rating as stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index}>
        {index < rating ? (
          <FaStar className="text-yellow-500" />
        ) : (
          <FaStar className="text-gray-300" />
        )}
      </span>
    ));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Feedback</h2>

      {/* Stats */}
      <div className="stats shadow mb-8">
        {/* Total Users Responded */}
        <div className="stat">
          <div className="stat-figure text-primary">
            <FaUsers size={30} />
          </div>
          <div className="stat-title">Total Users Responded</div>
          <div className="stat-value text-primary">{totalUsers}</div>
        </div>

        {/* Average Rating */}
        <div className="stat">
          <div className="stat-figure text-secondary">
            <FaStar size={30} />
          </div>
          <div className="stat-title">Average Rating</div>
          <div className="stat-value text-secondary">{averageRating}</div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          {/* Table Head */}
          <thead>
            <tr>
              <th>#</th>
              <th>Rating</th>
              <th>Experience</th>
              <th>Helpful Feature</th>
              <th>Improvements</th>
              <th>Design Feedback</th>
              <th>UI Confusion</th>
              <th>Mobile vs Web</th>
              <th>New Features</th>
              <th>Additional Comments</th>
              <th>Date Submitted</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {feedbackList.map((feedback, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-base-200" : ""}>
                <th>{index + 1}</th>

                {/* Star Rating Column */}
                <td>
                  <div className="flex items-center justify-center h-full">
                    {renderStars(feedback.rating)}
                  </div>
                </td>

                {/* Feedback Columns */}
                <td>{feedback.experience || "No feedback provided"}</td>
                <td>{feedback.helpfulFeature || "N/A"}</td>
                <td>{feedback.improvement || "N/A"}</td>
                <td>{feedback.designFeedback || "N/A"}</td>
                <td>{feedback.uiConfusion || "N/A"}</td>
                <td>{feedback.mobileWebDifference || "N/A"}</td>
                <td>{feedback.newFeatures || "N/A"}</td>
                <td>{feedback.additionalComments || "N/A"}</td>
                <td>
                  {feedback.createdAt?.toDate().toLocaleString() || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

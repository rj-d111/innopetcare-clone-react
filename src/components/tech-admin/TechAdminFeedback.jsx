import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { IoIosStar } from "react-icons/io";
import { IoStarOutline } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";

export default function TechAdminFeedback() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      const feedbackCollection = collection(db, "feedback");
      const feedbackSnapshot = await getDocs(feedbackCollection);
      const feedbackList = feedbackSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeedbackData(feedbackList);

      // Calculate Total Users and Average Rating
      const total = feedbackList.length;
      const totalRating = feedbackList.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
      const avgRating = total > 0 ? (totalRating / total).toFixed(1) : 0;
      setTotalUsers(total);
      setAverageRating(avgRating);
    };

    fetchFeedback();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <IoIosStar key={i} className="text-yellow-500" />
        ) : (
          <IoStarOutline key={i} className="text-gray-400" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Feedback</h2>
      
      {/* Stats */}
      <div className="stats shadow mb-4">
        <div className="stat">
          <div className="stat-figure text-primary">
            <FaUsers size={30} />
          </div>
          <div className="stat-title">Total Users Responded</div>
          <div className="stat-value text-primary">{totalUsers}</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <FaStar size={30} />
          </div>
          <div className="stat-title">Average Rating</div>
          <div className="stat-value text-secondary">{averageRating}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="p-2">Timestamp</th>
              <th className="p-2">Additional Comments</th>
              <th className="p-2">Feature Suggestion</th>
              <th className="p-2">Rating</th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((feedback) => (
              <tr key={feedback.id} className="hover:bg-gray-100">
                <td className="p-2">
                  {feedback.timestamp?.toDate().toLocaleString()}
                </td>
                <td className="p-2">{feedback.additionalComments || "N/A"}</td>
                <td className="p-2">{feedback.featureSuggestion || "N/A"}</td>
                <td className="p-2 flex space-x-1">
                  {renderStars(feedback.rating)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

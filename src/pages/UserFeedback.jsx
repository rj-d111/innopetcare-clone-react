import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

const UserFeedback = ({ projectId }) => {
  // Form state
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState({
    experience: "",
    helpfulFeature: "",
    improvement: "",
    designFeedback: "",
    uiConfusion: "",
    mobileWebDifference: "",
    newFeatures: "",
    additionalComments: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate the rating
    if (rating === 0) {
      toast.error("Please provide a rating between 1 to 5 stars.");
      return;
    }
  
    try {
      // Reference to the "user-feedback-cms" collection
      const feedbackRef = collection(db, "user-feedback-cms");
  
      // Save the feedback to Firestore
      await addDoc(feedbackRef, {
        rating, // integer from 1 to 5
        ...feedback,
        createdAt: serverTimestamp(),
      });
  
      toast.success("Thank you for your feedback!");
  
      // Reset the form after successful submission
      setRating(0);
      setFeedback({
        experience: "",
        helpfulFeature: "",
        improvement: "",
        designFeedback: "",
        uiConfusion: "",
        mobileWebDifference: "",
        newFeatures: "",
        additionalComments: "",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">We want your opinion!</h2>
      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-6">
          <label className="block text-lg font-medium mb-2">Rate us!</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`btn btn-circle ${rating >= star ? "btn-warning" : "btn-outline"}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Questions */}
        {[
          {
            name: "experience",
            label: "Please describe your overall experience using InnoPetCare. What do you like most, and what challenges have you encountered?",
          },
          {
            name: "helpfulFeature",
            label: "Which feature of InnoPetCare do you find most helpful, and how does it support your tasks effectively?",
          },
          {
            name: "improvement",
            label: "Are there any features that you believe need improvement? If so, please explain why and how you think they could be enhanced.",
          },
          {
            name: "designFeedback",
            label: "Do you find the design and layout of InnoPetCare intuitive and easy to navigate? If not, what changes would you suggest?",
          },
          {
            name: "uiConfusion",
            label: "Is there any part of the user interface that you found particularly confusing or difficult to use? Please share details.",
          },
          {
            name: "mobileWebDifference",
            label: "Do you notice any differences in your experience between the mobile and web versions of InnoPetCare? If so, please describe which version you prefer and why.",
          },
          {
            name: "newFeatures",
            label: "Are there any new features or functionalities you would like to see in InnoPetCare to better serve your needs or make your workflow easier?",
          },
          {
            name: "additionalComments",
            label: "Do you have any additional comments, suggestions, or feedback that you would like to share to help us improve InnoPetCare?",
          },
        ].map((question) => (
          <div key={question.name} className="mb-6">
            <label className="block text-lg font-medium mb-2">{question.label}</label>
            <textarea
              name={question.name}
              value={feedback[question.name]}
              onChange={handleChange}
              rows="4"
              className="textarea textarea-bordered w-full"
              placeholder="Your answer..."
            />
          </div>
        ))}

        {/* Submit Button */}
        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFeedback;

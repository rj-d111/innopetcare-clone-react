import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "../Spinner";

// Rating Component
const StarRating = ({ onChange, value }) => {
  const [rating, setRating] = useState(value);

  const handleStarClick = (index) => {
    setRating(index + 1);
    onChange(index + 1);
  };

  return (
    <div className="flex space-x-2 items-center">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          onClick={() => handleStarClick(index)} // Adjust index to be 1-based
          className={`cursor-pointer text-3xl ${
            index < rating ? "text-yellow-500" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function ProjectUserFeedback() {
  const { slug } = useParams();
  const [questions, setQuestions] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [headerColor, setHeaderColor] = useState("#3B82F6"); // Default color

  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const globalSectionsRef = collection(db, "global-sections");
        const slugQuery = query(globalSectionsRef, where("slug", "==", slug));
        const slugSnapshot = await getDocs(slugQuery);

        if (!slugSnapshot.empty) {
          const slugDoc = slugSnapshot.docs[0];
          setProjectId(slugDoc.id);

          // Fetch the headerColor attribute if it exists
          const data = slugDoc.data();
          if (data.headerColor) {
            setHeaderColor(data.headerColor);
          }
        }
      } catch (error) {
        console.error("Error fetching project info:", error);
      }
    };

    fetchProjectInfo();
  }, [slug]);

  // Fetch user feedback questions from Firestore
  useEffect(() => {
    if (projectId) {
      const fetchQuestions = async () => {
        try {
          const questionsRef = collection(
            db,
            "user-feedback",
            projectId,
            "questions"
          );
          const q = query(questionsRef, orderBy("questionCreated", "asc"));
          const querySnapshot = await getDocs(q);

          const fetchedQuestions = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setQuestions(fetchedQuestions);
        } catch (error) {
          console.error("Error fetching feedback questions:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [projectId]);

  // Handle form data change
  const handleChange = (questionId, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [questionId]: value,
    }));
  };

  // Form validation and submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that all required fields are filled out
    const unansweredQuestions = questions.filter(
      (q) =>
        !formData[q.id] ||
        (Array.isArray(formData[q.id]) && formData[q.id].length === 0)
    );

    if (unansweredQuestions.length > 0) {
      toast.error("Please answer all the questions!");
      return;
    }

    try {
      // Here you would save the feedback to Firestore or process it as needed
      console.log("Submitted data:", formData);
      toast.success("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback.");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">User Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="mb-4">
            <label className="block text-lg font-semibold mb-2">
              {question.question}
            </label>
            {question.type === "rating" && (
              <StarRating
                value={formData[question.id] || 0}
                onChange={(value) => handleChange(question.id, value)}
              />
            )}
            {question.type === "text" && (
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData[question.id] || ""}
                onChange={(e) => handleChange(question.id, e.target.value)}
                placeholder={question.placeholder || ""}
              />
            )}

            {question.type === "choice" && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={formData[question.id] === option}
                      onChange={(e) =>
                        handleChange(question.id, e.target.value)
                      }
                      style={{
                        accentColor: headerColor, // Tailwind's pink-500 color in hex
                        width: "20px",
                        height: "20px",
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === "checkbox" && (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={option}
                      checked={formData[question.id]?.includes(option) || false}
                      onChange={(e) => {
                        const selectedOptions = formData[question.id] || [];
                        if (e.target.checked) {
                          handleChange(question.id, [
                            ...selectedOptions,
                            option,
                          ]);
                        } else {
                          handleChange(
                            question.id,
                            selectedOptions.filter((item) => item !== option)
                          );
                        }
                      }}
                      style={{
                        accentColor: headerColor || "#EC4899", // Use dynamic color or default to pink-500
                      }}
                      className="checkbox"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="text-white py-2 px-6 rounded"
          style={{ backgroundColor: headerColor }}
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}

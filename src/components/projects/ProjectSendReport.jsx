import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, where, getDocs, orderBy, serverTimestamp, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "../Spinner";


export default function ProjectSendReport() {
  const { slug } = useParams();
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState("");

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Step 1: Fetch projectId using slug
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const globalSectionDoc = globalSectionsSnapshot.docs[0];
          const projectId = globalSectionDoc.id;
          setProjectId(projectId);

          // Step 2: Fetch questions from Firestore
          const questionsRef = collection(
            db,
            `send-report-section/${projectId}/questions`
          );
          const questionsQuery = query(
            questionsRef,
            orderBy("sectionCreated", "asc")
          );
          const questionsSnapshot = await getDocs(questionsQuery);

          const fetchedQuestions = questionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setQuestions(fetchedQuestions);
        } else {
          console.error("No matching project found for slug:", slug);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchQuestions();
    }
  }, [slug]);

  // Handle textarea input changes
  const handleChange = (id, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!projectId) {
        toast.error("Project ID is missing.");
        return;
      }

      // Prepare the response data
      const response = {
        projectId,
        responses: formData,
        createdAt: serverTimestamp(),
      };

      // Save to Firestore: /send-report-users/{projectId}/responses
      const responsesRef = collection(db, `send-report-users/${projectId}/responses`);
      await addDoc(responsesRef, response);

      toast.success("Report submitted successfully!");

      // Reset form after submission
      setFormData({});
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report.");
    }
  };

  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Send Report</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((question) => (
          <div key={question.id} className="mb-6">
            <label className="block text-lg font-medium mb-2">
              {question.question}
            </label>
            <textarea
              placeholder={question.placeholder}
              value={formData[question.id] || ""}
              onChange={(e) => handleChange(question.id, e.target.value)}
              rows="4"
              className="textarea textarea-bordered w-full"
            />
          </div>
        ))}
        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}

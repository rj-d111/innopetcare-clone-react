import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Spinner from "../Spinner";

export default function OwnerFeedback() {
  const { id } = useParams(); // Get projectId from URL
  const [reports, setReports] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch reports from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsRef = collection(db, `user-feedback-users/${id}/responses`);
        const reportsSnapshot = await getDocs(reportsRef);
        const fetchedReports = reportsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(fetchedReports);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    if (id) {
      fetchReports();
    }
  }, [id]);

  // Fetch questions by UID
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsMapTemp = {};
  
        // Loop through the responses to get the UIDs
        for (const report of reports) {
          const { responses } = report;
  
          // For each response, fetch the corresponding question from Firestore
          for (const uid of Object.keys(responses)) {
            if (!questionsMapTemp[uid]) {
              try {
                const questionDocRef = doc(db, `user-feedback/${id}/questions`, uid);
                const questionDoc = await getDoc(questionDocRef);

                if (questionDoc.exists()) {
                  const questionData = questionDoc.data();
                  questionsMapTemp[uid] = {
                    question: questionData.question,
                    type: questionData.type,
                  };
                } else {
                  console.warn(`No document found for UID: ${uid}`);
                  questionsMapTemp[uid] = { question: "Question not found", type: "text" };
                }
              } catch (error) {
                console.error(`Error fetching question for UID ${uid}:`, error);
              }
            }
          }
        }
        setQuestionsMap(questionsMapTemp);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (reports.length > 0) {
      fetchQuestions();
    }
  }, [reports, id]);

  if (loading) {
    return <Spinner />;
  }

  const questionHeaders = Object.values(questionsMap).map(q => q.question);

  // Function to render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Submitted Feedbacks</h2>

      {/* Check if reports are empty */}
      {reports.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No feedback has been submitted</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* Table Head */}
            <thead>
              <tr>
                <th>#</th>
                {questionHeaders.map((question, index) => (
                  <th
                    key={index}
                    className="max-w-[170px] break-words"
                    style={{ maxWidth: '170px', whiteSpace: 'normal' }}
                  >
                    {question}
                  </th>
                ))}
                <th>Date Submitted</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {reports.map((report, index) => (
                <tr key={report.id} className={index % 2 === 0 ? "bg-base-200" : ""}>
                  <th>{index + 1}</th>
                  {/* Render responses for each question */}
                  {Object.keys(questionsMap).map((uid) => {
                    const questionType = questionsMap[uid]?.type;
                    const response = report.responses[uid];

                    return (
                      <td
                        key={uid}
                        className="max-w-[170px] break-words"
                        style={{ maxWidth: '170px', whiteSpace: 'normal' }}
                      >
                        {questionType === "checkbox" && Array.isArray(response)
                          ? response.join(", ")
                          : questionType === "rating" && typeof response === "number"
                          ? renderStars(response)
                          : response || "No response"}
                      </td>
                    );
                  })}
                  {/* Date Submitted column */}
                  <td>{report.createdAt?.toDate().toLocaleString() || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

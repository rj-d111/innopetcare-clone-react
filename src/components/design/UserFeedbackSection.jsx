import React, { useState, useEffect } from "react";
import { collection, query, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { TbPencil } from "react-icons/tb";
import { CiTrash } from "react-icons/ci";
import UserFeedbackSectionModal from "./UserFeedbackSectionModal";
import ModalDelete from "../ModalDelete"; // Your delete confirmation modal
import { useParams } from "react-router";
import { toast } from "react-toastify";
import UserFeedbackSectionModalDelete from "./UserFeedbackSectionModalDelete";

export default function UserFeedbackSection() {
  const { id } = useParams(); // Project ID from URL params
  const [feedbackQuestions, setFeedbackQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch feedback questions for a specific projectId
  useEffect(() => {
    const fetchFeedbackQuestions = async () => {
      if (!id) return; // Ensure there's a project ID before fetching questions

      const questionsRef = collection(db, "user-feedback", id, "questions");
      const q = query(questionsRef);
      const querySnapshot = await getDocs(q);

      const questionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort questions by questionCreated timestamp in ascending order
      questionsList.sort(
        (a, b) => a.questionCreated.toMillis() - b.questionCreated.toMillis()
      );

      setFeedbackQuestions(questionsList);
    };

    fetchFeedbackQuestions();
  }, [id]); // Fetch when projectId (id) changes

  // Refresh the question list after adding or editing
  const handleQuestionAddedOrEdited = async () => {
    if (!id) return;

    const questionsRef = collection(db, "user-feedback", id, "questions");
    const querySnapshot = await getDocs(query(questionsRef));

    const questionsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort questions by questionCreated timestamp
    questionsList.sort(
      (a, b) => a.questionCreated.toMillis() - b.questionCreated.toMillis()
    );

    setFeedbackQuestions(questionsList);
    setIsModalOpen(false); // Close modal after saving changes
  };

  // Open modal to edit a question
  const handleEditClick = (question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  // Open modal to delete a question
  const handleDeleteClick = (question) => {
    setQuestionToDelete(question);
    setIsDeleteModalOpen(true);
  };

  // Handle question deletion
  const handleDeleteQuestion = async () => {
    if (questionToDelete) {
      try {
        const questionRef = doc(
          db,
          "user-feedback",
          id,
          "questions",
          questionToDelete.id
        );
        await deleteDoc(questionRef);
        setFeedbackQuestions((prevQuestions) =>
          prevQuestions.filter(
            (question) => question.id !== questionToDelete.id
          )
        );
        setIsDeleteModalOpen(false);
        setQuestionToDelete(null);
        toast.success("Question deleted successfully");
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Error deleting question");
      }
    }
  };

  // Check if rating and at least one other question type (text, checkbox, or choice) exist
  const hasRating = feedbackQuestions.some(q => q.type === 'rating');
  const hasOtherType = feedbackQuestions.some(q => ['text', 'checkbox', 'choice'].includes(q.type));
  const shouldShowWarning = !hasRating || !hasOtherType;

  return (
    <>
      {isModalOpen && (
        <UserFeedbackSectionModal
          closeModal={() => setIsModalOpen(false)}
          onQuestionAddedOrEdited={handleQuestionAddedOrEdited}
          selectedQuestion={selectedQuestion}
        />
      )}

      {isDeleteModalOpen && (
        <UserFeedbackSectionModalDelete
          title="Delete Confirmation"
          message={`Are you sure you want to delete the question: "${questionToDelete?.question}"? All data related to this question will be lost.`}
          onConfirm={handleDeleteQuestion}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}

      <div className="p-6 md:max-w-full  mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 h-full">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">User Feedback Section</h2>
          <p className="text-sm text-gray-700">
            Manage feedback questions to enhance user experience.
          </p>
        </div>

        {/* Conditional Warning */}
        {shouldShowWarning ? (
          <div role="alert" className="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Please add a question of type 'Rating' and at least one other type
              of question before publishing the site.
            </span>
          </div>
        ) : (
          <div role="alert" className="alert alert-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Successfully validated all User Feedback Questions</span>
          </div>
        )}

        <div className="mt-4">
          {feedbackQuestions.length === 0 ? (
            <div className="bg-white h-40 text-sm text-gray-600 flex items-center justify-center">
              You currently have no feedback questions.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {feedbackQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 bg-white rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold">
                      {question.question}
                    </h3>
                    <div className="justify-end flex">
                      <TbPencil
                        className="text-blue-600 cursor-pointer text-lg"
                        onClick={() => handleEditClick(question)}
                      />
                      <CiTrash
                        className="text-red-600 cursor-pointer text-lg"
                        onClick={() => handleDeleteClick(question)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-3 rounded-full font-semibold"
          onClick={() => {
            setSelectedQuestion(null); // Reset selected question for "Add New"
            setIsModalOpen(true); // Open modal for new question
          }}
        >
          + Add User Feedback Question
        </button>
      <div className="pb-2"></div>
      </div>
    </>
  );
}
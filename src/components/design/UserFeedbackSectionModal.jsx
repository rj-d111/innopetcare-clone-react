import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { IoClose } from "react-icons/io5";
import { IoIosAddCircleOutline } from "react-icons/io";
import { toast } from "react-toastify";
import { useParams } from "react-router";

export default function UserFeedbackSectionModal({
  closeModal,
  onQuestionAddedOrEdited,
  selectedQuestion,
}) {
  const {id} = useParams();
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("text");
  const [placeholder, setPlaceholder] = useState("");
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [isModified, setIsModified] = useState(false); // Track if data is modified
  useEffect(() => {
    if (selectedQuestion) {
      setQuestion(selectedQuestion.question);
      setType(selectedQuestion.type);
      setPlaceholder(selectedQuestion.placeholder || "");
      setOptions(selectedQuestion.options || []);
      setIsModified(false); // Reset on loading new question
    } else {
      setQuestion("");
      setType("text");
      setPlaceholder("");
      setOptions([]);
      setIsModified(false); // Reset on new question
    }
  }, [selectedQuestion]);

  // Handle adding new option
  const handleAddOption = () => {
    if (newOption.trim() !== "") {
      setOptions((prevOptions) => [...prevOptions, newOption]);
      setNewOption("");
      setIsModified(true); // Mark as modified
    }else{
      toast.error("Please add an option");
    }
  };

  // Handle deleting an option
  const handleDeleteOption = (index) => {
    setOptions((prevOptions) => prevOptions.filter((_, i) => i !== index));
    setIsModified(true); // Mark as modified
  };

  // Confirm type change if data is modified
  const handleTypeChange = (newType) => {
    if (isModified) {
      const isConfirmed = window.confirm(
        "Are you sure you want to switch the question type? Any unsaved changes will be lost."
      );
      if (isConfirmed) {
        // If confirmed, reset modified flag and change the type
        setIsModified(false);
        setType(newType);
        setOptions([]); // Clear options for non-choice/checkbox types
        setPlaceholder(""); // Clear placeholder if switching
      }
    } else {
      setType(newType);
      setOptions([]); // Clear options for non-choice/checkbox types
      setPlaceholder(""); // Clear placeholder if switching
    }
  };

  // Save changes to Firestore
  const handleSaveChanges = async () => {
    // Validation: Check if the question is filled for rating type
    if (type === "rating" && !question) {
      toast.error("Please fill out the question for rating type.");
      return; // Prevent saving if question is not filled
    }
  
    // Text type validation
    if (type === "text" && (!question || !placeholder)) {
      toast.error("Question and placeholder are required for text type.");
      return;
    }
  
    // Choice/Checkbox type validation
    if ((type === "choice" || type === "checkbox") && (!question || options.length < 2)) {
      toast.error("Please fill out the question and provide at least 2 options for choice/checkbox type.");
      return;
    }
  
    try {
      const projectId = id; // Replace with your logic for fetching the projectId (e.g., from useParams)
  
      const questionData = {
        question,
        type,
        questionCreated: new Date(), // Add current timestamp
        ...(type === "text" ? { placeholder } : {}),
        ...(type === "rating" || type === "choice" || type === "checkbox"
          ? { options }
          : {}),
      };
  
      // Adding or updating the question in Firestore under the specific projectId
      const questionRef = selectedQuestion
        ? doc(db, "user-feedback", projectId, "questions", selectedQuestion.id)
        : collection(db, "user-feedback", projectId, "questions");
  
      if (selectedQuestion) {
        // Update existing question
        await updateDoc(questionRef, questionData);
      } else {
        // Add new question
        await addDoc(questionRef, questionData);
      }
  
      onQuestionAddedOrEdited();
      closeModal();
      toast.success("Question successfully added");
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };
  
  return (
    <div className="bg-black bg-opacity-50 fixed inset-0 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-5xl relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <IoClose
          className="text-red-600 text-2xl absolute top-4 right-4 cursor-pointer"
          onClick={closeModal}
        />

        {/* Left Column: Form Inputs */}
        <div className="flex-1 p-4 overflow-y-auto max-h-full">
          <h3 className="font-bold text-lg mb-4">
            {selectedQuestion ? "Edit Question" : "Add New Question"}
          </h3>

          {/* Question Input (Text Area) */}
          <div className="form-control mb-4">
            <label className="label">Question:</label>
            <textarea
              rows="2"
              required
              placeholder="Enter your question"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                setIsModified(true); // Mark as modified
              }}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Type Selector */}
          <div className="form-control mb-4">
            <label className="label">Type:</label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="text">Text</option>
              <option value="rating">Rating</option>
              <option value="choice">Choice</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>

          {/* Placeholder for Text Type */}
          {type === "text" && (
            <div className="form-control mb-4">
              <label className="label">Placeholder:</label>
              <input
                type="text"
                placeholder="Enter placeholder text"
                value={placeholder}
                onChange={(e) => {
                  setPlaceholder(e.target.value);
                  setIsModified(true); // Mark as modified
                }}
                className="input input-bordered w-full"
              />
            </div>
          )}

          {/* Options for Choice/Checkbox Type */}
          {(type === "choice" || type === "checkbox") && (
            <div className="form-control mb-4">
              <label className="label">Options:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter an option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  className="input input-bordered flex-1"
                />

                <button
                      className="btn btn-success  text-white"
                      onClick={handleAddOption}
                    >
                      <IoIosAddCircleOutline /> Add 
                    </button>

              </div>
              <div className="mt-2 space-y-1">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="badge badge-secondary">{option}</span>
                    <IoClose
                      className="text-red-600 cursor-pointer"
                      onClick={() => handleDeleteOption(index)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save and Close Buttons */}
          <div className="flex justify-end space-x-2 mt-6">
            <button onClick={handleSaveChanges} className="btn btn-primary">
              Save Changes
            </button>
            <button onClick={closeModal} className="btn">
              Close
            </button>
          </div>
        </div>

        {/* Right Column: Question Preview */}
        <div className="hidden md:flex flex-1 p-4 border-l border-gray-300 overflow-y-auto max-h-full">
          <div className="flex-col flex-1">
            <h1 className="text-xl font-bold mb-4">Question Preview</h1>
            {/* Question Preview Container */}
            <div className="mockup-window border border-base-300 flex-1">
              <div className="border-t border-base-300 flex justify-start px-4 py-16 w-full">
                <div className="flex flex-col w-full">
                  {/* Display Question or Placeholder Text */}
                  <p className="font-semibold">{question || "Your question will appear here..."}</p>
                  {/* Rating Preview */}
                  {type === "rating" && (
                    <div className="rating rating-lg mt-4">
                      {[...Array(5)].map((_, index) => (
                        <input
                          key={index}
                          type="radio"
                          name="rating-preview"
                          className="mask mask-star-2 bg-orange-400"
                          readOnly
                        />
                      ))}
                    </div>
                  )}
                  {/* Choice Preview */}
                  {type === "choice" &&
                    options.map((option, index) => (
                      <div key={index} className="flex items-center mt-2">
                        <input
                          type="radio"
                          name="choice-preview"
                          className="radio radio-primary"
                          readOnly
                        />
                        <span className="ml-2">{option}</span>
                      </div>
                    ))}
                  {/* Checkbox Preview */}
                  {type === "checkbox" &&
                    options.map((option, index) => (
                      <div key={index} className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          readOnly
                        />
                        <span className="ml-2">{option}</span>
                      </div>
                    ))}
                  {/* Text Area Preview */}
                  {type === "text" && (
                    <textarea
                      className="textarea textarea-bordered w-full mt-4"
                      rows="2"
                      placeholder={placeholder || "Your placeholder here..."}
                      readOnly
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

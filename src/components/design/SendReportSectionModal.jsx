import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useParams } from "react-router";
import sendReportContents from "./sendReportContents";

export default function SendReportSectionModal({
  closeModal,
  onQuestionAddedOrEdited,
  selectedQuestion,
}) {
  const { id } = useParams();
  const [question, setQuestion] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  useEffect(() => {
    if (selectedQuestion) {
      // Populate fields if editing
      setQuestion(selectedQuestion.question);
      setPlaceholder(selectedQuestion.placeholder || "");
      setIsEditing(true);
    } else {
      // Reset fields if adding a new question
      setQuestion("");
      setPlaceholder("");
      setIsEditing(false);
    }
  }, [selectedQuestion]);

  const handleSave = async () => {
    const trimmedQuestion = question.trim();
    const trimmedPlaceholder = placeholder.trim();

    if (!trimmedQuestion) {
      toast.error("Please provide a question!");
      return;
    }

    try {
      const reportsRef = collection(db, "send-report-section", id, "questions");

      if (isEditing && selectedQuestion) {
        await setDoc(doc(reportsRef, selectedQuestion.id), {
          question: trimmedQuestion,
          placeholder: trimmedPlaceholder,
          sectionCreated: selectedQuestion.sectionCreated,
        });
        toast.success("Question updated successfully");
      } else {
        await setDoc(doc(reportsRef), {
          question: trimmedQuestion,
          placeholder: trimmedPlaceholder,
          sectionCreated: serverTimestamp(),
        });
        toast.success("Question added successfully");
      }

      onQuestionAddedOrEdited();
      closeModal();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Error saving question");
    }
  };


  // Carousel Navigation
  const handlePrev = () => {
    if (selectedTemplate > 0) {
      setSelectedTemplate(selectedTemplate - 1);
    }
  };

  const handleNext = () => {
    if (selectedTemplate < sendReportContents.questions.length - 1) {
      setSelectedTemplate(selectedTemplate + 1);
    }
  };

  // Handle selecting a template
  const handleSelectTemplate = () => {
    const template = sendReportContents.questions[selectedTemplate];
    setQuestion(template.question);
    setPlaceholder(template.placeholder);
    toast.success("Template applied!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-md w-full max-w-4xl p-6 flex flex-col md:flex-row">
        {/* Left Column: Input Form */}
        <div className="flex-1 p-4">
          <h2 className="text-2xl font-semibold mb-4">
            {isEditing ? "Edit Report Question" : "Add New Report Question"}
          </h2>

          {/* Carousel for Template Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Select a Template</h3>
            <div className="relative flex items-center">
              <button
                onClick={handlePrev}
                className={`btn btn-circle ${
                  selectedTemplate === 0 ? "invisible" : ""
                }`}
              >
                ❮
              </button>
              <div className="flex flex-col items-center mx-4 flex-1">
                <div className="w-full p-4 border border-gray-300 rounded-lg">
                  <h4 className="font-semibold text-xs">
                    {sendReportContents.questions[selectedTemplate].question}
                  </h4>
                  <p className="border border-gray-300 w-full text-gray-600 mt-2 text-[.5rem] p-2">
                    {sendReportContents.questions[selectedTemplate]
                      .placeholder || "No placeholder"}
                  </p>
                </div>
                <button
                  onClick={handleSelectTemplate}
                  className="btn btn-sm btn-primary mt-4"
                >
                  Apply Template
                </button>
              </div>
              <button
                onClick={handleNext}
                className={`btn btn-circle ${
                  selectedTemplate === sendReportContents.questions.length - 1
                    ? "invisible"
                    : ""
                }`}
              >
                ❯
              </button>
            </div>
          </div>

          {/* Question Input */}
          <div className="mb-4">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700"
            >
              Question
            </label>
            <textarea
              id="question"
              rows="2"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="Enter your question here"
            />
          </div>

          {/* Placeholder Input */}
          <div className="mb-4">
            <label
              htmlFor="placeholder"
              className="block text-sm font-medium text-gray-700"
            >
              Placeholder (Optional)
            </label>
            <input
              id="placeholder"
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter placeholder text"
            />
          </div>

          {/* Buttons */}
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              onClick={handleSave}
            >
              {isEditing ? "Save Changes" : "Add Question"}
            </button>
          </div>
        </div>

        {/* Right Column: Preview Section */}
        <div className="hidden md:flex flex-1 p-4 border-l border-gray-300 overflow-y-auto">
          <div className="flex flex-col w-full">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <div className="mockup-window border border-base-300 flex-grow w-full">
              <div className="border-t border-base-300 w-full flex justify-start px-4 py-16">
                <div className="w-full">
                  <p className="text-lg font-semibold">
                    {question || "Your question will appear here..."}
                  </p>
                  <textarea
                    className="textarea textarea-bordered w-full mt-4"
                    rows="2"
                    placeholder={placeholder || "Your placeholder..."}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

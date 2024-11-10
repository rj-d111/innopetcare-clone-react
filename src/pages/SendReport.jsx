import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export default function SendReport() {
  const [formData, setFormData] = useState({
    description: "",
    steps: "",
    impact: "",
    environment: "",
    frequency: "",
    dataLoss: "",
    performance: "",
    additionalInfo: "",
  });

  const auth = getAuth();
  const db = getFirestore();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Get the currently authenticated user ID
      const userId = auth.currentUser?.uid;

      if (!userId) {
        toast.error("You must be logged in to send a report.");
        return;
      }

      // Save the report to Firestore
      await addDoc(collection(db, "send-report"), {
        ...formData,
        userId,
        timestamp: new Date(),
      });

      // Show success message
      toast.success("Report submitted successfully!");

      // Reset the form
      setFormData({
        description: "",
        steps: "",
        impact: "",
        environment: "",
        frequency: "",
        dataLoss: "",
        performance: "",
        additionalInfo: "",
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit the report. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Send Report</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Please provide a detailed description of the issue you encountered:
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Steps to reproduce the issue:
          </label>
          <textarea
            name="steps"
            value={formData.steps}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Impact on Usage */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            How has this issue affected your ability to use InnoPetCare?
          </label>
          <textarea
            name="impact"
            value={formData.impact}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Environment Details */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Please specify the device, operating system, and browser you are using:
          </label>
          <textarea
            name="environment"
            value={formData.environment}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Frequency of Issue */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Is this issue occurring consistently or intermittently?
          </label>
          <textarea
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            rows="2"
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Data Loss or Security Concerns */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Did this issue result in any data loss or security concerns?
          </label>
          <textarea
            name="dataLoss"
            value={formData.dataLoss}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Performance Issues */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Have you noticed any performance-related issues?
          </label>
          <textarea
            name="performance"
            value={formData.performance}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Any additional information or context:
          </label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button type="submit" className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700">
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}

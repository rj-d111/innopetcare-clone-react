import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications
import { db } from '../firebase'; // Import your Firebase configuration
import { collection, addDoc } from 'firebase/firestore'; // Firestore functions
import { useNavigate } from 'react-router-dom'; // Use 'react-router-dom' for navigation

export default function UserFeedback() {
  const [rating, setRating] = useState(0);
  const [featureSuggestion, setFeatureSuggestion] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  let slug = "";

  if (parts.length > 1) {
    slug = parts[1].split("/")[0]; // Get the first part after "/"
  }

  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'feedback'), {
        rating,
        featureSuggestion,
        additionalComments,
        timestamp: new Date(),
      });
      toast.success('Feedback submitted successfully');
      
      // Reset form fields
      setRating(0);
      setFeatureSuggestion('');
      setAdditionalComments('');

      // Navigate to the dashboard (replace {slug} with the actual value)
      navigate(`/sites/${slug}/dashboard`); // Ensure 'slug' is defined or passed as a prop/state
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 ps-6">User Feedback</h1>
      <p className="mb-4 ps-6">We want your opinion!</p>
      <p className="mb-4 ps-6">How likely would you recommend our service to a friend or colleague?</p>

      {/* Star Rating System */}
      <div className="flex mb-4 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-8 h-8 cursor-pointer ${rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            onClick={() => setRating(star)}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 .587l3.668 7.428 8.244 1.207-5.95 5.559 1.405 8.167L12 18.897l-7.067 3.706 1.405-8.167-5.95-5.559 8.244-1.207L12 .587z" />
          </svg>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700">What feature can we add to improve?</label>
          <textarea
            className="border rounded-lg px-4 py-2 w-full h-24"
            value={featureSuggestion}
            onChange={(e) => setFeatureSuggestion(e.target.value)}
            placeholder="Your suggestion..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Additional Comments</label>
          <textarea
            className="border rounded-lg px-4 py-2 w-full h-24"
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            placeholder="Any additional comments..."
          />
        </div>

        <button
          type="submit"
          className="bg-yellow-500 w-full text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

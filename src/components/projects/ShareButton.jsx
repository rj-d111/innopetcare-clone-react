import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaWhatsapp, FaLink } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ShareButton({ postId, projectId, slug }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/sites/${slug}/community-forum/${projectId}/post/${postId}`;
    navigator.clipboard.writeText(link);
    toast.success("Post link copied to clipboard!");
    toggleModal(); // Close the modal after copying
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={toggleModal}
        className="hover:text-blue-500 flex items-center space-x-1"
      >
        <span>🔗</span>
        <span>Share</span>
      </button>

          {/* Modal */}
          {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Share this Post
            </h3>
            <div className="space-y-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/sites/${slug}/community-forum/${projectId}/post/${postId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2"
              >
                <FaFacebook />
                <span>Share on Facebook</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${window.location.origin}/sites/${slug}/community-forum/${projectId}/post/${postId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2"
              >
                <FaTwitter />
                <span>Share on Twitter</span>
              </a>
              <a
                href={`https://wa.me/?text=${window.location.origin}/sites/${slug}/community-forum/${projectId}/post/${postId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2"
              >
                <FaWhatsapp />
                <span>Share on WhatsApp</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="block text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2"
              >
                <FaLink />
                <span>Copy Link</span>
              </button>
            </div>
            <button
              onClick={toggleModal}
              className="mt-6 w-full text-gray-600 hover:text-gray-900 px-4 py-2 border rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

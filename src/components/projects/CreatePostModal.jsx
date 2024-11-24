import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { IoMdClose, IoMdImages } from "react-icons/io";
import TurndownService from "turndown";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import {
  doc,
  collection,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../firebase"; // Ensure this path is correct for your Firebase config
import { getAuth } from "firebase/auth";

function CreatePostModal({ isOpen, onClose, projectId, isAdmin = false }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const [selectedImages, setSelectedImages] = useState([]);
  const [markdownContent, setMarkdownContent] = useState("");
  const [title, setTitle] = useState(""); // Added state for the title
  const [showAlert, setShowAlert] = useState(false); // Alert confirmation
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  const turndownService = new TurndownService();

  const resetModal = () => {
    setSelectedImages([]);
    setMarkdownContent("");
    setTitle("");
    setShowAlert(false);
    onClose();
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContentChange = (value) => {
    setMarkdownContent(value); // Quill content (in HTML format)
  };

  const handlePost = async () => {
    // Validation: Ensure the title and content are not empty
    if (!title.trim() || !markdownContent.trim()) {
      toast.error("Please fill in both the title and content before posting!");
      return;
    }

    setIsLoading(true); // Start loading spinner

    try {
      // Convert Quill's HTML content to Markdown format
      const markdown = turndownService.turndown(markdownContent);

      // Firebase reference to community-forum/{projectId}/posts
      const postRef = doc(collection(db, `community-forum/${projectId}/posts`));

      // Fetch the profileImage from the clients table
      const userDocRef = doc(db, "clients", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error("User profile not found.");
      }

      const userData = userDocSnap.data();
      const profileImage = userData.profileImage || null; // Fallback if no profileImage exists
      const authorName = userData.name || "Anonymous"; // Fallback if no name exists

      // Prepare the post data
      const postData = {
        postId: postRef.id,
        title: title.trim(),
        content: markdown, // Save markdown-formatted content
        images: selectedImages.map(
          (image) => image.name || URL.createObjectURL(image)
        ), // Assuming you have image URLs or File objects
        authorId: user.uid, // Ensure `user` is from Firebase Auth context
        authorName, // Fetch name from clients table
        profileImage, // Save the profile image
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0,
        sharedCount: 0,
        isAdmin,
        isDeleted: false, // Post is not deleted initially
        isEdited: false, // Post is not edited initially
      };

      // Save the post to Firestore
      await setDoc(postRef, postData);

      // Success message
      toast.success("Post created successfully!");

      // Reset modal after posting
      resetModal();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again later.");
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  const handleClose = () => {
    // Check if the modal is empty before showing confirmation dialog
    if (!title && !markdownContent && selectedImages.length === 0) {
      resetModal(); // Directly close if no content is present
    } else {
      setShowAlert(true); // Show confirmation modal if content is present
    }
  };

  const confirmClose = (proceed) => {
    if (proceed) {
      resetModal(); // Reset the modal content when the user confirms "Yes"
    } else {
      setShowAlert(false); // Dismiss the alert if the user clicks "No"
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-screen"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold">Create a New Post</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoMdClose />
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (Optional)"
            maxLength={300}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
          {/* Quill Editor */}
          <ReactQuill
            value={markdownContent}
            onChange={handleContentChange}
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ indent: "-1" }, { indent: "+1" }],
                ["link"],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "blockquote",
              "list",
              "bullet",
              "indent",
              "link",
              "clean",
            ]}
            placeholder="Share your story or ask a question about animals..."
          />
        </div>

        {/* Drag and Drop Images */}
        <div
          className="mt-4 border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center"
          onDrop={handleImageDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p className="text-sm text-gray-500">Drag and drop images here</p>
          <p className="text-sm text-gray-500">or</p>

          {/* Button to trigger file input */}
          <button
            className="btn flex items-center space-x-2"
            onClick={() => document.getElementById("file-upload").click()}
          >
            <IoMdImages />
            <span>Select Images</span>
          </button>

          {/* Hidden File Input */}
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Display Selected Images */}
        {selectedImages.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Selected ${index}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <IoMdClose />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={isLoading} // Disable button during loading
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center ${
              isLoading ? "cursor-not-allowed" : ""
            }`}
          >
            {isLoading && (
              <>
                <AiOutlineLoading3Quarters className="animate-spin mr-2" />
                Processing...
              </>
            )}
            {!isLoading && "Post"}
          </button>
        </div>
      </div>

      {/* Alert Confirmation */}
      {showAlert && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-60"
          onClick={(e) => e.stopPropagation()} // Prevent click propagation
        >
          <div
            className="bg-white rounded-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()} // Prevent click propagation inside the modal
          >
            <p className="text-center mb-4">
              Are you sure you want to quit without saving changes?
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => confirmClose(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                No
              </button>
              <button
                onClick={() => confirmClose(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePostModal;

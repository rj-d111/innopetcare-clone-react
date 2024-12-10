import React, { useEffect, useState } from "react";
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
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function CreatePostModal({
  isOpen,
  onClose,
  projectId,
  isAdmin = false,
  editPostData = null,
}) {
  const auth = getAuth();
  const user = auth.currentUser;
  const [selectedImages, setSelectedImages] = useState([]);
  const [markdownContent, setMarkdownContent] = useState("");
  const [title, setTitle] = useState(""); // Added state for the title
  const [showAlert, setShowAlert] = useState(false); // Alert confirmation
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  const turndownService = new TurndownService();

  // Populate the modal with the post data when editing
  useEffect(() => {
    if (editPostData) {
      setTitle(editPostData.title || "");
      setMarkdownContent(editPostData.content || "");
      setSelectedImages(editPostData.images || []);
    } else {
      setTitle("");
      setMarkdownContent("");
      setSelectedImages([]);
    }
  }, [editPostData]);

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
    if (!title.trim() || !markdownContent.trim()) {
      toast.error("Please fill in the title and the content before posting!");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const markdown = turndownService.turndown(markdownContent);
  
      // Upload images to Firebase Storage
      const storage = getStorage();
      const uploadedImageUrls = await Promise.all(
        selectedImages.map(async (image) => {
          if (typeof image === "string") return image; // If the image is already a URL, keep it
          const storageRef = ref(
            storage,
            `community-forum/${projectId}/posts/${
              editPostData?.id || "newPost"
            }/${image.name}`
          );
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        })
      );
  
      // Fetch user data from the `clients` collection
      const clientRef = doc(db, "clients", user.uid);
      const clientSnap = await getDoc(clientRef);
  
      if (!clientSnap.exists()) {
        throw new Error("Client information not found.");
      }
  
      const clientData = clientSnap.data();
      const authorName = clientData.name || "Anonymous"; // Get `name` from `clients`
      const profileImage = clientData.profileImage || null; // Get `profileImage` from `clients`
  
      // Firestore document reference
      const postRef = editPostData
        ? doc(db, `community-forum/${projectId}/posts`, editPostData.id)
        : doc(collection(db, `community-forum/${projectId}/posts`));
  
      // Prepare post data
      const postData = {
        title: title.trim(),
        content: markdown,
        images: uploadedImageUrls,
        authorId: user.uid,
        authorName, // Fetched from `clients`
        profileImage, // Fetched from `clients`
        updatedAt: serverTimestamp(),
        isAdmin,
        isDeleted: false,
        isEdited: !!editPostData,
      };
  
      if (!editPostData) {
        postData.createdAt = serverTimestamp();
        postData.updatedAt = serverTimestamp();
        postData.likesCount = 0;
        postData.commentsCount = 0;
        postData.sharedCount = 0;
      }
  
      // Save post data to Firestore
      await setDoc(postRef, postData);
  
      toast.success(
        editPostData
          ? "Post updated successfully!"
          : "Post created successfully!"
      );
      resetModal();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save the post. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleClose = () => {
    if (!title && !markdownContent && selectedImages.length === 0) {
      resetModal();
    } else {
      setShowAlert(true);
    }
  };

  const confirmClose = (proceed) => {
    if (proceed) {
      resetModal();
    } else {
      setShowAlert(false);
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold">
            {editPostData ? "Edit Post" : "Create a New Post"}
          </h2>
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

          <button
            className="btn flex items-center space-x-2"
            onClick={() => document.getElementById("file-upload").click()}
          >
            <IoMdImages />
            <span>Select Images</span>
          </button>

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
                  src={typeof image === "string" ? image : URL.createObjectURL(image)}
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

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={isLoading}
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
            {!isLoading && (editPostData ? "Save Changes" : "Post")}
          </button>
        </div>
      </div>
      {showAlert && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-60"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()}
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

import React, { useEffect, useState } from "react";
import ProjectCreatePostModal from "./CreatePostModal";
import { useLocation, useNavigate, useParams } from "react-router";
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import useAuthStatusUsers from "../hooks/useAuthStatusUsers";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { BsThreeDots } from "react-icons/bs";
import PostContent from "./PostContent";

export default function ProjectCommunityForum() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editPostData, setEditPostData] = useState(null); // For editing post
  const auth = getAuth();
  const { slug } = useParams();
  const [projectId, setProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const openModal = () => {
    const user = auth.currentUser;
    if (!user) {
      toast.info("You must be logged in to create a post.");
      navigate(`/sites/${slug}/login`);
      return;
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditPostData(null); // Reset edit post data
  };

  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].id;
          setProjectId(docId);
        } else {
          console.error("No project found for the given slug.");
        }
      } catch (error) {
        console.error("Error fetching projectId:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectId();
  }, [slug]);

  useEffect(() => {
    if (!projectId) return;

    const fetchPosts = async () => {
      try {
        const postsQuery = query(
          collection(db, `community-forum/${projectId}/posts`),
          where("isDeleted", "==", false)
        );
        const querySnapshot = await getDocs(postsQuery);

        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [projectId]);

  const handleEdit = (post) => {
    setEditPostData(post); // Pass post data to modal for editing
    setIsModalOpen(true);
  };

  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmDelete) {
      return; // If the user cancels, exit the function
    }

    try {
      const postRef = doc(db, `community-forum/${projectId}/posts`, postId);
      await updateDoc(postRef, { isDeleted: true });
      toast.success("Post deleted successfully.");
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete the post.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-white shadow-md rounded-lg p-4 space-y-6">
        <h2 className="text-lg font-semibold">Community</h2>
        <div className="space-y-4">
          {/* Navigation Links */}
          <ul className="space-y-2">
            <li className="font-medium text-gray-700 hover:text-blue-500">
              My Threads
            </li>
            <li className="font-medium text-gray-700 hover:text-blue-500">
              Saved Posts
            </li>
          </ul>

          {/* Current Courses */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Current Course
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Public Finance</span>
                <span className="text-xs bg-blue-500 text-white py-1 px-2 rounded-full">
                  3
                </span>
              </li>
              <li className="text-sm text-gray-700 hover:text-blue-500">
                Corporate Law
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-2/4">
        {/* Add a New Thread */}
        <div className="p-6">
          {/* Add Post Placeholder */}
          <div
            className="flex flex-col items-center justify-center bg-gray-100 border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-200"
            onClick={openModal}
          >
            <p className="text-lg font-medium text-gray-700">+ Add Post</p>
            <p className="text-sm text-gray-500">
              Share your story or question
            </p>
          </div>

          {/* Modal */}
          <ProjectCreatePostModal
            isOpen={isModalOpen}
            onClose={closeModal}
            projectId={projectId}
            editPostData={editPostData}
          />
        </div>

        {/* Threads/Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.profileImage || "https://via.placeholder.com/40"}
                    alt={post.authorName || "Anonymous"}
                    className="rounded-full w-10 h-10 object-cover"
                  />

                  <div>
                    <h3 className="text-sm font-semibold">
                      {post.authorName || "Anonymous"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt.seconds * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {post.authorId === auth.currentUser?.uid && (
                  <div className="relative">
                    <BsThreeDots
                      className="cursor-pointer hover:text-gray-700"
                      onClick={() =>
                        setPosts((prev) =>
                          prev.map((p) =>
                            p.id === post.id
                              ? { ...p, showMenu: !p.showMenu }
                              : p
                          )
                        )
                      }
                    />
                    {post.showMenu && (
                      <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="block w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-4 py-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="block w-full text-left text-sm text-red-700 hover:bg-red-100 px-4 py-2"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-gray-800">{post.title}</h4>
              <PostContent content={post.content} />
              {/* <p className="text-sm text-gray-600">{post.content}</p> */}
              <div className="mt-3 flex space-x-4 text-gray-500">
                <button className="hover:text-blue-500 flex items-center space-x-1">
                  <span>👍</span>
                  <span>Like</span>
                </button>
                <button className="hover:text-blue-500 flex items-center space-x-1">
                  <span>💬</span>
                  <span>Comment</span>
                </button>
                <button className="hover:text-blue-500 flex items-center space-x-1">
                  <span>🔗</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-1/4 bg-white shadow-md rounded-lg p-4 space-y-6">
        <h3 className="text-lg font-semibold">Owner Details</h3>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-semibold">Business Name:</p>
            <p className="text-sm text-gray-600">Pawfect Care</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Contact Number:</p>
            <p className="text-sm text-gray-600">+1 555-123-4567</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Email:</p>
            <p className="text-sm text-gray-600">owner@pawfectcare.com</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Location:</p>
            <p className="text-sm text-gray-600">123 Main Street, New York</p>
          </div>
        </div>
      </div>
    </div>
  );
}

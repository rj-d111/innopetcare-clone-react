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
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import useAuthStatusUsers from "../hooks/useAuthStatusUsers";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { BsThreeDots } from "react-icons/bs";
import PostContent from "./PostContent";
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import ProjectCommunityForumDetails from "./ProjectCommunityForumDetails";
import ImageCarousel from "./ImageCarousel";

export default function ProjectCommunityForum() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [editPostData, setEditPostData] = useState(null); // For editing post
  const [expandedPostId, setExpandedPostId] = useState(null); // For toggling comments
  const [commentInput, setCommentInput] = useState(""); // Input for new comment
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

    const postsQuery = query(
      collection(db, `community-forum/${projectId}/posts`),
      where("isDeleted", "==", false)
    );

    // Set up the onSnapshot listener
    const unsubscribe = onSnapshot(
      postsQuery,
      (querySnapshot) => {
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData); // Update state with real-time data
      },
      (error) => {
        console.error("Error fetching posts:", error);
      }
    );

    // Cleanup the listener on component unmount or when projectId changes
    return () => unsubscribe();
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

  const handleComment = async (postId) => {
    const user = auth.currentUser;

    if (!user) {
      toast.info("You must be logged in to comment.");
      navigate(`/sites/${slug}/login`);
      return;
    }

    if (!commentInput.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    try {
      // Fetch user data from the clients collection
      const clientRef = doc(db, "clients", user.uid);
      const clientSnapshot = await getDoc(clientRef);

      if (!clientSnapshot.exists()) {
        toast.error("User data not found in the clients table.");
        return;
      }

      const clientData = clientSnapshot.data();

      const postRef = doc(db, `community-forum/${projectId}/posts`, postId);

      // Add comment to the Firestore post
      await updateDoc(postRef, {
        comments: arrayUnion({
          comment: commentInput,
          userId: user.uid,
          userName: clientData.name || "Anonymous",
          profileImage:
            clientData.profileImage || "https://via.placeholder.com/40",
          createdAt: new Date(),
        }),
      });

      // Update comments locally for immediate UI update
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...(post.comments || []),
                  {
                    comment: commentInput,
                    userId: user.uid,
                    userName: clientData.name || "Anonymous",
                    profileImage:
                      clientData.profileImage ||
                      "https://via.placeholder.com/40",
                    createdAt: new Date(),
                  },
                ],
              }
            : post
        )
      );

      setCommentInput(""); // Reset comment input
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error commenting on post:", error);
      toast.error("Failed to add comment.");
    }
  };

  const toggleComments = (postId) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-full lg:w-1/6 p-4 space-y-6"></div>

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
                      {post.updatedAt && post.updatedAt.seconds
                        ? new Date(
                            post.updatedAt.seconds * 1000
                          ).toLocaleString()
                        : "Date not available"}
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
              <p className="text-sm text-gray-600">{post.content}</p>

              {/* Image Carousel */}
              {post.images && post.images.length > 0 && (
                <div className="mt-4">
                  <ImageCarousel images={post.images} />
                </div>
              )}

              <div className="mt-3 flex space-x-4 text-gray-500">
                <LikeButton
                  postId={post.id}
                  projectId={projectId}
                  likes={post.likes || []}
                />
                <button
                  className="hover:text-blue-500 flex items-center space-x-1"
                  onClick={() => toggleComments(post.id)}
                >
                  <span>💬</span>
                  <span>Comment</span>
                </button>
                <ShareButton
                  postId={post.id}
                  projectId={projectId}
                  slug={slug}
                />
              </div>

              {/* Comments Section */}
              {expandedPostId === post.id && (
                <div className="mt-4">
                  {/* Display Comments */}
                  <div className="space-y-2">
                    {post.comments?.map((comment, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 bg-gray-100 p-2 rounded-lg"
                      >
                        <img
                          src={comment.profileImage}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {comment.userName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {comment.comment}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Section */}
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 mt-4"
                  ></textarea>
                  <button
                    onClick={() => handleComment(post.id)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Comment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <ProjectCommunityForumDetails projectId={projectId} />
    </div>
  );
}

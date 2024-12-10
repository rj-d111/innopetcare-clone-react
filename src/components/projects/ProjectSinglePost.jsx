import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import LikeButton from "./LikeButton";
import ShareButton from "./ShareButton";
import ImageCarousel from "./ImageCarousel";

export default function ProjectSinglePost() {
  const { slug, projectId, postId } = useParams(); // Extract params
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const auth = getAuth();

  useEffect(() => {
    if (!postId || !projectId) return;

    const postRef = doc(db, `community-forum/${projectId}/posts`, postId);

    // Set up the onSnapshot listener for real-time updates
    const unsubscribe = onSnapshot(
      postRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPost({ id: snapshot.id, ...snapshot.data() });
        } else {
          toast.error("Post not found.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching post:", error);
        toast.error("Error loading post.");
        setLoading(false);
      }
    );

    // Cleanup listener
    return () => unsubscribe();
  }, [postId, projectId]);

  const handleComment = async () => {
    const user = auth.currentUser;

    if (!user) {
      toast.info("You must be logged in to comment.");
      return;
    }

    if (!commentInput.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    try {
      const postRef = doc(db, `community-forum/${projectId}/posts`, postId);

      await updateDoc(postRef, {
        comments: arrayUnion({
          comment: commentInput,
          userId: user.uid,
          userName: user.displayName || "Anonymous",
          profileImage: user.photoURL || "https://via.placeholder.com/40",
          createdAt: new Date(),
        }),
      });

      setCommentInput(""); // Reset comment input
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment.");
    }
  };

  if (loading) {
    return <p>Loading post...</p>;
  }

  if (!post) {
    return <p>No post found.</p>;
  }

  return (
    <div className="p-6min-h-screen max-w-3xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={post.profileImage || "https://via.placeholder.com/40"}
            alt={post.authorName || "Anonymous"}
            className="rounded-full w-10 h-10 object-cover"
          />
          <div>
            <h3 className="text-sm font-semibold">{post.authorName || "Anonymous"}</h3>
            <p className="text-xs text-gray-500">
              {post.updatedAt?.seconds
                ? new Date(post.updatedAt.seconds * 1000).toLocaleString()
                : "Date not available"}
            </p>
          </div>
        </div>
        <h4 className="font-semibold text-gray-800">{post.title}</h4>
        <p className="text-sm text-gray-600">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className="mt-4">
            <ImageCarousel images={post.images} />
          </div>
        )}

        <div className="mt-4 flex space-x-4">
          <LikeButton
            postId={post.id}
            projectId={projectId}
            likes={post.likes || []}
          />
          <ShareButton
            postId={post.id}
            projectId={projectId}
            slug={slug}
          />
        </div>

        <div className="mt-6">
          <h5 className="font-medium text-gray-800">Comments</h5>
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
                  <p className="text-sm font-medium text-gray-800">{comment.userName}</p>
                  <p className="text-sm text-gray-600">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>

          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 mt-4"
          ></textarea>
          <button
            onClick={handleComment}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}

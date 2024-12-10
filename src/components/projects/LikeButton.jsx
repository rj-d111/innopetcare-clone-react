import React, { useEffect, useState } from "react";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { db } from "../../firebase";

export default function LikeButton({ postId, projectId, likes }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const [userLiked, setUserLiked] = useState(false); // Check if user liked the post
  const [recentLikers, setRecentLikers] = useState([]);
  const [likeCount, setLikeCount] = useState(likes?.length || 0); // Total likes

  useEffect(() => {
    if (user && likes) {
      setUserLiked(likes.includes(user.uid)); // Check if current user liked the post
    }
  }, [likes, user]);

  useEffect(() => {
    const fetchRecentLikers = async () => {
      if (!likes || likes.length === 0) return;
      try {
        const likers = await Promise.all(
          likes.slice(0, 3).map(async (userId) => {
            const clientRef = doc(db, "clients", userId);
            const clientSnapshot = await getDoc(clientRef);
            return clientSnapshot.exists()
              ? clientSnapshot.data().name
              : "Anonymous";
          })
        );
        setRecentLikers(likers);
      } catch (error) {
        console.error("Error fetching recent likers:", error);
      }
    };

    fetchRecentLikers();
  }, [likes]);

  const handleLike = async () => {
    if (!user) {
      toast.info("You must be logged in to like this post.");
      return;
    }

    const postRef = doc(db, `community-forum/${projectId}/posts`, postId);

    try {
      if (userLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
        });
        setLikeCount((prev) => prev - 1);
        setUserLiked(false);
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
        });
        setLikeCount((prev) => prev + 1);
        setUserLiked(true);
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      toast.error("Failed to update like. Please try again.");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* <span>👍</span> {recentLikers.length > 0 && (
        <p className="text-sm text-gray-600">
          {recentLikers[0]}
          {recentLikers.length > 1 && ` and ${recentLikers.length - 1} others`}
        </p>
      )} */}
      <button
        onClick={handleLike}
        className={`flex items-center space-x-1 ${
          userLiked ? "text-blue-500" : "text-gray-500"
        } hover:text-blue-500`}
      >
        <span>👍</span>
        <span>{userLiked ? "Unlike" : "Like"}</span>
      </button>
     
    </div>
  );
}

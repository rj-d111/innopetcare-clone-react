import { getAuth, sendEmailVerification, signOut, onAuthStateChanged } from "firebase/auth"; 
import { useState, useEffect } from "react";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { doc, updateDoc, getFirestore } from "firebase/firestore"; // Firestore imports

export default function EmailVerification() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const db = getFirestore(); // Initialize Firestore

  function onChange(e) {
    setEmail(e.target.value);
  }

  // Sign out function
  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate("/login"); // Redirect to login after sign-out
    toast.success("Successfully signed out");
  };

  // Function to update Firestore after email verification
  const updateIsVerifiedInFirestore = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid); // Assuming user's UID is used as the document ID in the 'users' collection
      await updateDoc(userRef, {
        isVerified: true,
      });
      toast.success("User verified status updated in Firestore");
    } catch (error) {
      toast.error("Error updating Firestore: " + error.message);
    }
  };

  // Check user verification status on auth state change
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        updateIsVerifiedInFirestore(user);
      }
    });
    return () => unsubscribe(); // Clean up subscription
  }, []);

  // Send verification email function
  async function onSubmit(e) {
    e.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        await sendEmailVerification(user);
        toast.success("Verification email sent");
        navigate("/login");
      } else {
        toast.error("No user is currently signed in");
      }
    } catch (error) {
      toast.error("Could not send verification email");
    }
  }

  return (
    <div className="flex items-center justify-center my-10 mx-3 text-center">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/2 w-full">
        <div className="flex justify-center">
          <div className="bg-yellow-300 rounded-full p-5 flex items-center justify-center">
            <MdEmail className="text-6xl text-yellow-900" />
          </div>
        </div>
        <h1 className="font-bold text-yellow-900 text-3xl mb-4">
          Verify your Email Address
        </h1>
        <p className="text-gray-600">
          You're almost there! We've sent you an email to
        </p>
        <p className="font-bold">{email || "your email"}</p>
        <p className="text-gray-600 my-4">
          Just click on the link in that email to complete your signup. If you
          don't see it, check your spam folder. Please refresh the page after verifying your email.
        </p>
        <p className="mt-4 text-gray-600">Can't find the email? No problem</p>
        <button
          type="submit"
          className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg mt-6"
          onClick={onSubmit}
        >
          Resend Verification Email
        </button>

        {/* Sign Out Button */}
        <button
          className="text-yellow-500 mt-6 float-right underline"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

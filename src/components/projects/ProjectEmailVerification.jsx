import {
  getAuth,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useState, useEffect } from "react";
import { MdEmail } from "react-icons/md";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { doc, updateDoc, getFirestore } from "firebase/firestore";

export default function ProjectEmailVerification() {
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore(); // Firestore instance
  const { slug } = useParams();

  useEffect(() => {
    const auth = getAuth();
    console.log("this is a projectemailverification");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email);
        setIsVerified(user.emailVerified);

        if (!user.emailVerified) {
          try {
            // Send verification email automatically if not verified
            await sendEmailVerification(user);
            toast.success("Verification email sent to your email address");
          } catch (error) {
            toast.error("Error sending verification email: " + error.message);
          }

          // Start polling for verification status
          const interval = setInterval(async () => {
            setIsChecking(true);
            await user.reload(); // Reload user data from Firebase Auth
            if (user.emailVerified) {
              setIsVerified(true);
              clearInterval(interval); // Stop polling when verified
              toast.success("Your email has been verified!");

              // Update verification status in Firestore
              updateIsVerifiedInFirestore(user);
            }
            setIsChecking(false);
          }, 5000); // Check every 5 seconds

          return () => clearInterval(interval); // Cleanup on unmount
        }
      } else {
        setEmail(null);
        setIsVerified(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to update Firestore after email verification
  const updateIsVerifiedInFirestore = async (user) => {
    try {
      const userRef = doc(db, "clients", user.uid); // Update user document in Firestore
      await updateDoc(userRef, { isVerified: true });
      toast.success("User verification status updated in Firestore");
    } catch (error) {
      // toast.error("Error updating Firestore: " + error.message);
    }
  };

  // Handle sign-out
  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate(`/sites/${slug}`);
    toast.success("Successfully signed out");
    window.location.reload(); // Add this line to refresh the page
  };

  // Resend verification email manually
  const handleResendEmail = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        toast.success("Verification email resent successfully");
      } else {
        toast.error("No user is signed in or email is already verified");
      }
    } catch (error) {
      // toast.error("Failed to resend verification email: " + error.message);
    }
  };

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
        {isVerified ? (
          <>
            <p className="text-green-600 font-bold">
              Your email has been verified! You can now proceed.
            </p>
            <button
              className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg mt-6"
              onClick={() => {
                  navigate(`/sites/${slug}/dashboard`);
                window.location.reload(); // Refresh the entire page
              }}
            >
              Proceed
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-600">
              You're almost there! We've sent an email to:
            </p>
            <p className="font-bold">{email || "your email"}</p>
            <p className="text-gray-600 my-4">
              Click the link in the email to verify your account. If you don't
              see it, check your spam folder. We are checking for your
              verification status automatically.
            </p>
            {isChecking && <p className="text-blue-600">Checking status...</p>}
            <button
              className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg mt-6"
              onClick={handleResendEmail}
            >
              Resend Verification Email
            </button>
          </>
        )}
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

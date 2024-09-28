import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

// Function to fetch the user role from Firestore
export const fetchUserRole = async (user) => {
  try {
    // Check in the users collection
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data().role; // Return the role field from the user document
    } else {
      // Check if user exists in the clients collection
      const clientDocRef = doc(db, "clients", user.uid);
      const clientDoc = await getDoc(clientDocRef);
      
      if (clientDoc.exists()) {
        return clientDoc.data().role; // Return the role field from the client document
      } else {
        return null; // No role found, treat as guest
      }
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null; // Return null if there is an error
  }
};

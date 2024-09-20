import { getAuth, updateProfile } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
    phone: "",
  });
  const [oldPhone, setOldPhone] = useState(""); // Store the old phone number
  const [oldName, setOldName] = useState(""); // Store the old name

  const { name, email, phone } = formData;

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const docRef = doc(db, "users", auth.currentUser.uid); // Fetch by user ID
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setFormData((prevState) => ({
          ...prevState,
          phone: userData.phone, // Set phone number from Firestore
          name: userData.name,
        }));
        setOldPhone(userData.phone); // Store the original phone number
        setOldName(userData.name); // Store the original name
      } else {
        console.log("No such document!");
      }
    };

    fetchUserData();
  }, [auth.currentUser.uid]);

  function onLogout() {
    auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  }

  async function onSubmit() {
    try {
      // Validate phone number (after trimming the "+63")
      const phoneNumberWithoutPrefix = phone.replace('+63', '');

      if (!/^9\d{9}$/.test(phoneNumberWithoutPrefix)) {
        toast.error(
          "The phone number must start with 9 and be followed by 9 digits."
        );
        // Revert back to old phone number
        setFormData((prevState) => ({
          ...prevState,
          phone: oldPhone, // Restore the old phone number from state
        }));
        return;
      }

      if (!name) {
        toast.error("The name input cannot be empty ");
        setFormData((prevState) => ({
          ...prevState,
          name: oldName, // Restore the old namee from state
        }));
        return;
      }

      const docRef = doc(db, "users", auth.currentUser.uid);

      // Update Firestore if phone or name changes
      if (auth.currentUser.displayName !== name || phone !== `+63${phoneNumberWithoutPrefix}`) {
        // Update display name in Firebase Auth if it changed
        if (auth.currentUser.displayName !== name) {
          await updateProfile(auth.currentUser, {
            displayName: name,
          });
        }

        // Update name and phone in Firestore
        await updateDoc(docRef, {
          name: name,
          phone: `+63${phoneNumberWithoutPrefix}`, // Store with "+63"
        });

        toast.success("Profile details updated");
      }
    } catch (error) {
      toast.error("Could not update the profile details");
    }
  }

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  return (
    <>
      <section className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="container flex flex-col md:flex-row items-center justify-center my-10 mx-3">
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/2 w-full">
            <div className="text-center mb-6">
              <img
                src="/images/innopetcare-black.png"
                alt="InnoPetCare Logo"
                className="mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-yellow-900 flex flex-col sm:flex-row items-center justify-center">
                My Profile{" "}
              </h2>
            </div>

            <form onSubmit={onSubmit}>
              <div className="mb-5">
                <label htmlFor="name" className="block text-gray-500 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  disabled={!changeDetail}
                  onChange={onChange}
                  placeholder="Enter your name"
                  className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out ${
                    changeDetail && "bg-yellow-300 focus:bg-yellow-400"
                  }`}
                />
              </div>
              <div className="mb-5">
                <label htmlFor="email" className="block text-gray-500 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
                />
              </div>
              <div className="mb-5">
                <label htmlFor="phone" className="block text-gray-500 mb-2">
                  Phone No. (Format: +639XXXXXXXXX)
                </label>
                <div className="flex">
                  <div className="w-1/6 bg-gray-200 text-center py-2 rounded-l-lg border border-gray-300">
                    +63
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={phone.replace('+63', '')} // Trim the "+63" prefix
                    disabled={!changeDetail}
                    onChange={onChange}
                    placeholder="Enter your Phone No."
                    className={`w-5/6 px-4 py-2 rounded-r-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out ${
                      changeDetail && "bg-yellow-300 focus:bg-yellow-400"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg active:shadow-lg transition duration-200 ease-in-out"
              >
                Submit
              </button>
            </form>

            <div className="flex justify-between whitespace-nowrap sm:text-sm my-6">
              <p className="flex items-center text-gray-600">
                Do you want to change your profile information?
                <span
                  onClick={() => {
                    if (changeDetail) {
                      onSubmit(); // Apply changes
                    }
                    setChangeDetail((prevState) => !prevState); // Toggle edit mode
                  }}
                  className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                >
                  {changeDetail ? "Apply Changes" : "Edit"}
                </span>
              </p>
              <p
                onClick={onLogout}
                className="text-yellow-600 hover:text-yellow-800 transition duration-200 ease-in-out cursor-pointer"
              >
                Sign out
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

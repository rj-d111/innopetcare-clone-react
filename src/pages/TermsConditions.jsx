import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import AlertAgreement from "../components/projects/AlertAgreement";
import { getAuth } from "firebase/auth";

export default function TermsConditions() {
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  let slug = parts.length > 1 ? parts[1].split("/")[0] : "";

  const [clinicName, setClinicName] = useState("");
  const [colorText, setColorText] = useState("#854d0e");
  const [userAgreed, setUserAgreed] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userUid = currentUser?.uid ?? "";

  useEffect(() => {
    const fetchProjectIdAndCheckUser = async () => {
      try {
        // Step 1: Fetch projectId using the slug
        const clinicQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(clinicQuery);

        let fetchedProjectId = "";
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedProjectId = doc.id;
            setClinicName(data.name || "InnoPetCare");
            setColorText(data.headerColor);
          });
        } else {
          console.log("No clinic found with the provided slug.");
          setClinicName("InnoPetCare");
        }

        // Step 2: Check if a user is logged in and projectId is set
        if (currentUser && fetchedProjectId) {
          console.log("logged in user uid is", userUid);
          // Step 3: Query the `clients` table by `projectId`
          const clientsQuery = query(
            collection(db, "clients"),
            where("projectId", "==", fetchedProjectId)
          );
          const clientsSnapshot = await getDocs(clientsQuery);
          
         // Step 4: Loop through the documents to check if any match the current user's UID
          let userFound = false;
          for (const doc of clientsSnapshot.docs) {
            if (currentUser.uid === doc.id) {
              userFound = true;
              break; // Exit the loop when a match is found
            }
          }
          

          // Step 5: Set `userAgreed` if a matching UID was found
          if (userFound) {
            setUserAgreed(true);
          }
        } else {
          console.log(
            "No user is currently logged in or projectId is missing."
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchProjectIdAndCheckUser();
  }, [slug, currentUser]);

  return (
    <section id="terms">
      <div className="bg-white">
        <div className="max-w-2xl mx-auto p-5">
          {userAgreed && (
            <AlertAgreement message="You have already accepted the Terms and Conditions." />
          )}
          <h1
            className="text-2xl md:text-4xl font-bold my-4 text-center"
            style={{ color: colorText }}
          >
            {clinicName || "InnoPetCare"} Terms and Conditions
          </h1>

          <p className="text-gray-600">
            Welcome to {clinicName || "InnoPetCare"}. By accessing or using our
            services, you agree to comply with and be bound by the following
            terms and conditions. Please read them carefully.
          </p>
          <section className="my-6">
            <h2 className="text-lg font-semibold">General</h2>
            <p className="text-gray-600">
              These terms and conditions govern your use of{" "}
              {clinicName || "InnoPetCare"}’s website and services.
            </p>
            <p className="text-gray-600">
              We require 24 hours' notice for any cancellations or rescheduling.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="text-lg font-semibold">Services</h2>
            <p className="text-gray-600">
              It is your responsibility to arrive on time for your appointment.
              If you are late, we may need to reschedule your appointment to
              ensure other clients are not inconvenienced.
            </p>
            <p className="text-gray-600">
              We reserve the right to refuse treatment to any animal if it is
              deemed necessary for health, safety, or ethical reasons.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="text-lg font-semibold">Medical Records</h2>
            <p className="text-gray-600">
              {clinicName || "InnoPetCare"} will take all reasonable care in
              providing services to your pet. However, we cannot be held liable
              for any unforeseen complications or adverse reactions resulting
              from treatments.
            </p>
            <p className="text-gray-600">
              You agree to indemnify and hold {clinicName || "InnoPetCare"}{" "}
              harmless from any claims, damages, or expenses arising from your
              use of our services.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="text-lg font-semibold">Privacy</h2>
            <p className="text-gray-600">
              We are committed to protecting your privacy. All personal
              information collected will be used in accordance with our Privacy
              Policy.
            </p>
            <p className="text-gray-600">
              We may use your contact information to send you updates,
              reminders, and promotional materials related to our services.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="text-lg font-semibold">Changes to Terms</h2>
            <p className="text-gray-600">
              {clinicName || "InnoPetCare"} reserves the right to modify these
              terms and conditions at any time. Any changes will be posted on
              our website and will become effective immediately.
            </p>
            <p className="text-gray-600">
              Your continued use of our services after any changes constitutes
              your acceptance of the new terms and conditions.
            </p>
          </section>
          <section className="mb-6">
            <h2 className="text-lg font-semibold">Governing Law</h2>
            <p className="text-gray-600">
              These terms and conditions are governed by and construed in
              accordance with the laws of the jurisdiction in which{" "}
              {clinicName || "InnoPetCare"} operates.
            </p>
            <p className="text-gray-600">
              Any disputes arising out of or in connection with these terms and
              conditions shall be subject to the exclusive jurisdiction of the
              courts in that jurisdiction.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}

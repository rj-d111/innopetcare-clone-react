import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import AlertAgreement from "../projects/AlertAgreement";
import { getAuth } from "firebase/auth";

export default function ProjectPrivacyPolicy() {
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
        // Fetch projectId using the slug
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

        // Check if a user is logged in and projectId is set
        if (currentUser && fetchedProjectId) {
          console.log("logged in user uid is", userUid);

          // Query the `clients` table by `projectId`
          const clientsQuery = query(
            collection(db, "clients"),
            where("projectId", "==", fetchedProjectId)
          );
          const clientsSnapshot = await getDocs(clientsQuery);

          // Loop through the documents to check if any match the current user's UID
          let userFound = false;
          for (const doc of clientsSnapshot.docs) {
            if (userUid === doc.id) {
              userFound = true;
              break;
            }
          }

          // Set `userAgreed` if a matching UID was found
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
    <div className="max-w-2xl mx-auto p-5">
      {userAgreed && (
        <AlertAgreement message="You’ve already agreed to the Privacy Policy." />
      )}
      <h1
        className="text-2xl md:text-4xl font-bold my-4 text-center"
        style={{ color: colorText }}
      >
        {clinicName} Privacy Policy
      </h1>

      <p className="text-gray-700 mb-4">
        At {clinicName}, we prioritize your privacy and are committed to
        safeguarding your personal information. This Privacy Policy outlines how
        we collect, use, disclose, and protect your data when you use our web
        platform designed for veterinary clinics and animal shelters.
      </p>

      <h2 className="text-xl font-semibold mb-2">Information We Collect</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>
          <strong>Personal Information:</strong> We collect information such as
          your name, email address, phone number, and any other contact details
          you provide during registration or use of the platform.
        </li>
        <li>
          <strong>Pet Information:</strong> Details about the pets you manage,
          including names, breeds, ages, medical histories, and adoption
          statuses.
        </li>
        <li>
          <strong>Usage Data:</strong> Information about your interactions with
          our platform, including IP address, browser type, device information,
          and pages visited.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        How We Use Your Information
      </h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>
          Service Delivery: To provide and manage services related to veterinary
          care, pet management, and communication.
        </li>
        <li>
          Platform Improvement: To analyze usage trends and enhance user
          experience by improving our services.
        </li>
        <li>
          Communication: To send you updates and notifications related to{" "}
          {clinicName}.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Disclosure of Your Information
      </h2>
      <p className="text-gray-700 mb-4">
        <strong>Legal Compliance:</strong> We may disclose your information if
        required by law or to protect our rights and the safety of users.
      </p>

      <h2 className="text-xl font-semibold mb-2">Data Security</h2>
      <p className="text-gray-700 mb-4">
        We implement industry-standard security measures, including encryption
        and access controls, to protect your information from unauthorized
        access and misuse.
      </p>

      <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
      <p className="text-gray-700 mb-4">
        You have the right to access, correct, or delete your personal
        information. To exercise these rights, please contact us at [insert
        contact information].
      </p>

      <h2 className="text-xl font-semibold mb-2">Changes to This Policy</h2>
      <p className="text-gray-700 mb-4">
        We may update this Privacy Policy from time to time. Any changes will be
        posted on our platform with an updated effective date.
      </p>

      <h1 className="text-3xl font-bold text-center mb-6 mt-12">
        Terms of Use for {clinicName}
      </h1>

      <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
      <p className="text-gray-700 mb-4">
        By accessing or using {clinicName}, you acknowledge that you have read,
        understood, and agree to be bound by these Terms of Use.
      </p>

      <h2 className="text-xl font-semibold mb-2">User Responsibilities</h2>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>
          Account Security: You are responsible for maintaining the
          confidentiality of your account information and for all activities
          that occur under your account.
        </li>
        <li>
          Lawful Use: You agree to use the platform in compliance with all
          applicable laws and regulations.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Intellectual Property</h2>
      <p className="text-gray-700 mb-4">
        All content, features, and functionality of the {clinicName} platform
        are the property of {clinicName} or its licensors and are protected by
        copyright and other intellectual property laws.
      </p>

      <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
      <p className="text-gray-700 mb-4">
        {clinicName} is not liable for any direct, indirect, incidental, or
        consequential damages arising from your use of or inability to use the
        platform.
      </p>

      <h2 className="text-xl font-semibold mb-2">Modifications to Terms</h2>
      <p className="text-gray-700 mb-4">
        We reserve the right to modify these Terms at any time. Changes will be
        effective immediately upon posting on the platform. Your continued use
        constitutes acceptance of the modified Terms.
      </p>

      <h2 className="text-xl font-semibold mb-2">Governing Law</h2>
      <p className="text-gray-700 mb-4">
        These Terms shall be governed by the laws of the Republic of the
        Philippines. Any disputes will be resolved in accordance with applicable
        Philippine laws.
      </p>

      <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
      <p className="text-gray-700 mb-4">
        For questions about these Terms or our Privacy Policy, please contact us
        at{" "}
        <a href="mailto:innopetcare.gmail.com" className="text-blue-500">
          innopetcare@gmail.com
        </a>{" "}
        or call us at 887-2651.
      </p>
    </div>
  );
}

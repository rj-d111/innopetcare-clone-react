import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function ProjectContact() {
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    email: "",
    address: "",
    facebook: "",
  });

  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  let slug;

  // Check if there's a part after "sites/"
  if (parts.length > 1) {
    slug = parts[1].split("/")[0]; // Get only the first part after "/"
  }
  console.log(slug);

  const db = getFirestore();

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        // Step 1: Get projectId from global-sections using the slug
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          globalSectionsSnapshot.forEach(async (doc) => {
            const projectId = doc.data().projectId;

            // Step 2: Fetch contact info from contact-info using projectId
            const contactInfoQuery = query(
              collection(db, "contact-info"),
              where("projectId", "==", projectId)
            );
            const contactInfoSnapshot = await getDocs(contactInfoQuery);

            if (!contactInfoSnapshot.empty) {
              contactInfoSnapshot.forEach((contactDoc) => {
                // Update the state with the fetched contact information
                setContactInfo({
                  phone: contactDoc.data().phone || "",
                  email: contactDoc.data().email || "",
                  address: contactDoc.data().address || "",
                  facebook: contactDoc.data().facebook || "",
                });
              });
            } else {
              console.log(
                "No matching contact-info document found for projectId:",
                projectId
              );
            }
          });
        } else {
          console.log(
            "No matching global-sections document found for slug:",
            slug
          );
        }
      } catch (error) {
        console.error("Error fetching contact information:", error);
      }
    };

    if (slug) {
      fetchContactInfo();
    }
  }, [slug, db]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="p-10">
        <div className="p-6 rounded-lg shadow-md max-w-2xl mx-auto bg-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mt-6">Contact Details</h2>
          </div>
          <div className="p-10">
            <p>
              <span className="font-bold">Phone Number:</span>{" "}
              {contactInfo.phone || "N/A"}
            </p>
            <p>
              <span className="font-bold">Email:</span>{" "}
              {contactInfo.email || "N/A"}
            </p>
            <p>
              <span className="font-bold">Address:</span>{" "}
              {contactInfo.address || "N/A"}
            </p>
            <p>
              <span className="font-bold">Facebook Page Link:</span>{" "}
              <a
                href={contactInfo.facebook || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contactInfo.facebook || "N/A"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default function ProjectAbout() {
  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    picture: "",
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
    const fetchProjectData = async () => {
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

            // Step 2: Fetch data from about-sections using the projectId
            const aboutSectionsQuery = query(
              collection(db, "about-sections"),
              where("projectId", "==", projectId)
            );
            const aboutSectionsSnapshot = await getDocs(aboutSectionsQuery);

            if (!aboutSectionsSnapshot.empty) {
              aboutSectionsSnapshot.forEach((aboutDoc) => {
                // Update the state with the fetched data
                setAboutData({
                  title: aboutDoc.data().title || "",
                  description: aboutDoc.data().description || "", // Use description here
                  picture: aboutDoc.data().picture || "",
                });
              });
            } else {
              console.log(
                "No matching about-sections document found for projectId:",
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
        console.error("Error fetching project data:", error);
      }
    };

    if (slug) {
      fetchProjectData();
    }
  }, [slug, db]);

  return (
    <div className="container">
      <div className="flex flex-col md:flex-row items-center p-10">
        <div className="md:w-1/2 p-4">
          <h1 className="text-slate-900 text-3xl font-bold mb-2">
            {aboutData.title || "Default Title"}
          </h1>
          <p className="text-gray-700 text-xl">
            {aboutData.description || "Default Description"} {/* Change this line */}
          </p>
        </div>
        <div className="md:w-1/2 p-4">
          <img
            src={aboutData.picture || "https://via.placeholder.com/400"}
            alt="Project Image"
            className="w-full h-auto"
          />
        </div>
      </div>
      <div>
        <p className="text-center p-4 text-xl">
          {aboutData.description || "Default Description"} {/* Change this line */}
        </p>
      </div>
    </div>
  );
}

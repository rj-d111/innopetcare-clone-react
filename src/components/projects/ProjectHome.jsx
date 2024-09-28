import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export default function ProjectHome() {
  const [homeData, setHomeData] = useState({
    title: "",
    subtext: "",
    picture: "",
    content: "",
  });

  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  var slug;

 

  // Check if there's a part after "sites/"
  if (parts.length > 1) {
    slug = parts[1].split("/")[0]; // Get only the first part after "/"
   }   
   console.log(slug);
   
   const db = getFirestore();

  // Fetch projectId from global-sections using the slug, then fetch home-sections data
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

            // Step 2: Fetch data from home-sections using the projectId
            const homeSectionsQuery = query(
              collection(db, "home-sections"),
              where("projectId", "==", projectId)
            );
            const homeSectionsSnapshot = await getDocs(homeSectionsQuery);

            if (!homeSectionsSnapshot.empty) {
              homeSectionsSnapshot.forEach((homeDoc) => {
                // Update the state with the fetched data
                setHomeData({
                  title: homeDoc.data().title || "",
                  subtext: homeDoc.data().subtext || "",
                  picture: homeDoc.data().picture || "",
                  content: homeDoc.data().content || "",
                });
              });
            } else {
              console.log("No matching home-sections document found for projectId:", projectId);
            }
          });
        } else {
          console.log("No matching global-sections document found for slug:", slug);
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
    <>
      <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center p-10">
            <div className="md:w-1/2 p-4">
              <h1 className="text-slate-900 text-3xl font-bold mb-2">{homeData.title || "Default Title"}</h1>
              <p className="text-gray-700 text-xl">{homeData.subtext || "Default Subtext"}</p>
            </div>
            <div className="md:w-1/2 p-4">
              <img
                src={homeData.picture || "https://via.placeholder.com/400"}
                alt="Project Image"
                className="w-full h-auto"
              />
            </div>
          </div>
          <div>
            <p className="text-center p-4 text-xl">{homeData.content || "Default Content"}</p>
          </div>
      </div>
    </>
  );
}

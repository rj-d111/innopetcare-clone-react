import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Footer from "../Footer";
import { useParams } from "react-router";
import ProjectDonateSites from "./ProjectDonateSites";
import ProjectFooter from "./ProjectFooter";
import { FaDollarSign } from "react-icons/fa";

export default function ProjectDonate() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerColor, setHeaderColor] =useState('#4A00FF');
  const { slug } = useParams();
  const db = getFirestore();

  useEffect(() => {
    const fetchDonationSections = async () => {
      try {
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const globalSectionDoc = globalSectionsSnapshot.docs[0];
          const projectId = globalSectionDoc.id;
          const globalSectionData = globalSectionDoc.data();

          setHeaderColor(globalSectionData['headerColor']);


          const sectionsRef = collection(db, `donations/${projectId}/sections`);
          const sectionsSnapshot = await getDocs(sectionsRef);

          const fetchedSections = sectionsSnapshot.docs.map((sectionDoc) => ({
            id: sectionDoc.id,
            ...sectionDoc.data(),
          }));

          setSections(fetchedSections);
        } else {
          console.log(
            "No matching global-sections document found for slug:",
            slug
          );
        }
      } catch (error) {
        console.error("Error fetching donation sections:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDonationSections();
    }
  }, [slug, db]);

  return (
    <>
      <div className="container mx-auto">
        {loading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 gap-4 p-10 h-[calc(100vh-64px)]">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 items-center my-4"
              >
                <div className="skeleton h-6 w-80 bg-gray-300 rounded-md"></div>
                <div className="skeleton h-6 w-10/12 bg-gray-300 rounded-md"></div>
                <div className="skeleton h-6 w-full bg-gray-300 rounded-md"></div>
                <div className="skeleton h-80 w-full bg-gray-300 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="mb-10">
              <div className="m-10 md:min-h-[50vh] flex flex-col justify-center items-center text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {section.sectionTitle || "Default Title"}
                </h2>
                <p className="text-xl text-gray-700 mb-4">
                  {section.sectionSubtext || "Default Subtext"}
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  {section.sectionContent || "Default Content"}
                </p>
              </div>

              {/* Conditional Rendering for Carousel or Grid */}
              {section.sectionType === "carousel" &&
                section.sectionImages?.length > 0 && (
                  <div className="carousel w-full">
                    {section.sectionImages.map((image, index) => (
                      <div
                        key={index}
                        id={`slide${index + 1}`}
                        className="carousel-item relative w-full h-[calc(100vh-64px)]"
                      >
                        <img
                          src={image}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {section.sectionImages.length > 1 && (
                          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                            <a
                              href={`#slide${
                                index === 0
                                  ? section.sectionImages.length
                                  : index
                              }`}
                              className="btn btn-circle"
                            >
                              ❮
                            </a>
                            <a
                              href={`#slide${
                                index + 2 > section.sectionImages.length
                                  ? 1
                                  : index + 2
                              }`}
                              className="btn btn-circle"
                            >
                              ❯
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {section.sectionType === "grid" &&
                section.sectionImages?.length > 0 && (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${
                      section.sectionImages.length >= 4
                        ? 4
                        : section.sectionImages.length
                    } gap-4`}
                  >
                    {section.sectionImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Grid ${index + 1}`}
                        className="w-full md:h-[calc(100vh-64px)] object-cover rounded"
                      />
                    ))}
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      <ProjectDonateSites />
      <div className="mx-auto my-5 text-center">
  {/* Instruction Text */}
  <p className="text-gray-700 font-medium mb-3 text-center">
    If you want to donate supplies, you may click the button below
  </p>

  {/* Donate Button */}
  <button
    className="btn text-white px-6 py-3 rounded-lg mx-auto flex items-center"
    style={{ backgroundColor: headerColor }}
    onClick={() => {
      window.location.href = "appointments";
    }}
  >
    <FaDollarSign className="mr-2" /> Donate Now
  </button>
</div>


      <ProjectFooter />
    </>
  );
}

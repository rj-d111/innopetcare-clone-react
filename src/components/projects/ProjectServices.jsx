import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Footer from "../Footer";
import ProjectFooter from "./ProjectFooter";

export default function ProjectServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true); // New loading state
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  let slug;

  if (parts.length > 1) {
    slug = parts[1].split("/")[0];
  }

  const db = getFirestore();

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const globalSectionDoc = globalSectionsSnapshot.docs[0];
          const projectId = globalSectionDoc.id;

          const servicesQuery = query(
            collection(db, "services"),
            where("projectId", "==", projectId)
          );
          const servicesSnapshot = await getDocs(servicesQuery);

          if (!servicesSnapshot.empty) {
            const servicesData = servicesSnapshot.docs.map((serviceDoc) => ({
              id: serviceDoc.id,
              ...serviceDoc.data(),
            }));
            setServices(servicesData);
          } else {
            console.log("No matching services documents found for projectId:", projectId);
          }
        } else {
          console.log("No matching global-sections document found for slug:", slug);
        }
      } catch (error) {
        console.error("Error fetching services data:", error);
      } finally {
        setLoading(false); // Stop loading when data is fetched
      }
    };

    if (slug) {
      fetchServicesData();
    }
  }, [slug, db]);

  return (
    <>
      <div className="text-center text-2xl font-bold p-5">Services</div>
      <div className="md:min-h-[calc(100vh-64px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-10">
          {loading ? (
            // Placeholder while loading
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex w-52 flex-col gap-4 animate-pulse">
                <div className="skeleton h-32 w-full bg-gray-300 rounded-md"></div>
                <div className="skeleton h-4 w-28 bg-gray-300 rounded-md"></div>
                <div className="skeleton h-4 w-full bg-gray-300 rounded-md"></div>
                <div className="skeleton h-4 w-full bg-gray-300 rounded-md"></div>
              </div>
            ))
          ) : services.length > 0 ? (
            services.map((service) => (
              <div key={service.id} className="border rounded-lg shadow-md p-4 flex flex-col items-center">
                <img src={service.icon} alt={service.title} className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-semibold">{service.title}</h2>
                <p className="text-gray-700 text-center">{service.description}</p>
                <p className="text-sm text-gray-500 text-center mt-2">{service.additional}</p>
              </div>
            ))
          ) : (
            <p>No services available.</p>
          )}
        </div>
      </div>
      <ProjectFooter />
    </>
  );
}

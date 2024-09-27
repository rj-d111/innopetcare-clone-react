import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export default function ProjectServices() {
  const [services, setServices] = useState([]);
  const pathname = window.location.href;
  const parts = pathname.split('sites/');
  let slug;

  // Check if there's a part after "sites/"
  if (parts.length > 1) {
    slug = parts[1].split('/')[0]; // Get only the first part after "/"
  }

  const db = getFirestore();

  // Fetch services based on the projectId from global-sections
  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        // Step 1: Get projectId from global-sections using the slug
        const globalSectionsQuery = query(
          collection(db, 'global-sections'),
          where('slug', '==', slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          globalSectionsSnapshot.forEach(async (doc) => {
            const projectId = doc.data().projectId;

            // Step 2: Fetch data from services using the projectId
            const servicesQuery = query(
              collection(db, 'services'),
              where('projectId', '==', projectId)
            );
            const servicesSnapshot = await getDocs(servicesQuery);

            if (!servicesSnapshot.empty) {
              const servicesData = servicesSnapshot.docs.map((serviceDoc) => ({
                id: serviceDoc.id,
                ...serviceDoc.data(),
              }));
              setServices(servicesData);
            } else {
              console.log('No matching services documents found for projectId:', projectId);
            }
          });
        } else {
          console.log('No matching global-sections document found for slug:', slug);
        }
      } catch (error) {
        console.error('Error fetching services data:', error);
      }
    };

    if (slug) {
      fetchServicesData();
    }
  }, [slug, db]);

  return (
    <>
      <div className="text-center text-2xl font-bold p-5">Services</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-10">
        {services.length > 0 ? (
          services.map((service) => (
            <div key={service.id} className="border rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold">{service.title}</h2>
              <p className="text-gray-700">{service.description}</p>
            </div>
          ))
        ) : (
          <p>No services available.</p>
        )}
      </div>
    </>
  );
}

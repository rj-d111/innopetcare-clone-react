import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import ServicesModal from "./ServicesModal";
import { db } from "../../firebase.js";

export default function Services() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams(); // Get project UUID from the URL

  // Fetch services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      const q = query(collection(db, "services"), where("projectId", "==", id));
      const querySnapshot = await getDocs(q);
      const servicesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesList);
    };

    fetchServices();
  }, [id]);

  // Handle adding a service and refreshing the list
  const handleServiceAdded = async () => {
    const q = query(collection(db, "services"), where("projectId", "==", id));
    const querySnapshot = await getDocs(q);
    const servicesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setServices(servicesList);
  };

  return (
    <>
      {/* Modal to add a service */}
      {isModalOpen && (
        <ServicesModal
          projectId={id}
          closeModal={() => setIsModalOpen(false)}
          onServiceAdded={handleServiceAdded}
        />
      )}
      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-screen">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Services Page</h2>
          <p className="text-sm text-gray-700">
            The "Services page" typically outlines the various features and
            functionalities that the CMS offers to help manage a veterinary
            practice or animal care facility.
          </p>
        </div>

        {/* Display services */}
        <div className="mt-4">
          {services.length === 0 ? (
            <div className="bg-white h-40 text-sm text-gray-600 flex items-center justify-center">
              You don't have currently added services here
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 bg-white rounded-lg shadow-md"
                >
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="text-gray-700">{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Button to add service */}

        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-3 rounded-full font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Services
        </button>

        <button
          type="button"
          className="w-full uppercase bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-800 shadow-md hover:shadow-lg active:shadow-lg"
        >
          Save Changes
        </button>
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { useParams } from "react-router";
import ServicesModal from "./ServicesModal";
import ModalDelete from "../ModalDelete"; // Import your delete modal
import { db } from "../../firebase.js";
import { TbPencil } from "react-icons/tb";
import { CiTrash } from "react-icons/ci";
import { toast } from "react-toastify";

export default function Services() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null); 
  const [serviceToDelete, setServiceToDelete] = useState(null); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const { id } = useParams(); 

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

  const handleServiceAdded = async () => {
    const q = query(collection(db, "services"), where("projectId", "==", id));
    const querySnapshot = await getDocs(q);
    const servicesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setServices(servicesList);
  };

  const handleEditClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true); 
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service); 
    setIsDeleteModalOpen(true); 
  };

  const handleDeleteService = async () => {
    if (serviceToDelete) {
      try {
        await deleteDoc(doc(db, "services", serviceToDelete.id)); 
        setServices((prevServices) =>
          prevServices.filter((service) => service.id !== serviceToDelete.id)
        ); 
        toast.success(`Successfully deleted`); // Show success toast
        setIsDeleteModalOpen(false); 
        setServiceToDelete(null); 
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  return (
    <>
      {isModalOpen && (
        <ServicesModal
          projectId={id}
          closeModal={() => setIsModalOpen(false)}
          onServiceAdded={handleServiceAdded}
          selectedService={selectedService}
        />
      )}

      {/* ModalDelete is conditionally rendered based on isDeleteModalOpen */}
      {isDeleteModalOpen && (
        <ModalDelete
          message={`Are you sure you want to delete ${serviceToDelete?.title}?`}
          onConfirm={handleDeleteService} 
          onCancel={() => setIsDeleteModalOpen(false)} 
        />
      )}

      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-screen">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Services Page</h2>
          <p className="text-sm text-gray-700">
            The "Services page" typically outlines the various features and functionalities...
          </p>
        </div>

        <div className="mt-4">
          {services.length === 0 ? (
            <div className="bg-white h-40 text-sm text-gray-600 flex items-center justify-center">
              You don't have currently added services here
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {services.map((service) => (
                <div key={service.id} className="p-4 bg-white rounded-lg shadow-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{service.title}</h3>
                    <div className="justify-end flex">
                      <TbPencil
                        className="text-blue-600 cursor-pointer text-lg"
                        onClick={() => handleEditClick(service)}
                      />
                      <CiTrash
                        className="text-red-600 cursor-pointer text-lg"
                        onClick={() => handleDeleteClick(service)}
                      />
                    </div>
                  </div>
                  <p className="text-gray-700">{service.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-3 rounded-full font-semibold"
          onClick={() => {
            setSelectedService(null);
            setIsModalOpen(true);
          }}
        >
          + Add Services
        </button>
      </div>
    </>
  );
}

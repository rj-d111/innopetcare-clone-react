import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { db } from "../../firebase"; // Firebase config
import { IoIosAddCircleOutline } from "react-icons/io";
import { collection, getDocs, query, where } from "firebase/firestore";
import OwnerPetsModal from "./OwnerPetsModal";

export default function OwnerPetOwners() {
  const { id } = useParams(); // Get projectId from route params
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showModal, setShowModal] = useState(false); // Toggle modal visibility
  const [selectedClient, setSelectedClient] = useState(null); // Selected client for Add Pets

  useEffect(() => {
    const fetchClients = async () => {
      const clientsCollection = collection(db, "clients");
      const q = query(clientsCollection, where("projectId", "==", id));
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setClients(clientsData);
      setFilteredClients(clientsData);
    };
    fetchClients();
  }, [id]);

  useEffect(() => {
    console.log("Selected Client:", selectedClient);
    console.log("Show Modal:", showModal);
  }, [selectedClient, showModal]);

  
  return (
    <div className="p-6">
      {/* Modal for Adding Pets */}
      {showModal && (
        <OwnerPetsModal
          clientId={selectedClient.id}
          projectId={id}
          clientName={selectedClient.name}
          closeModal={() => setShowModal(false)}
        />
      )}
      <h2 className="text-2xl font-bold mb-4">Pet Owners</h2>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client, index) => (
                <tr key={client.id}>
                  <th>{index + 1}</th>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>
                    <button
                      className="btn btn-success btn-sm text-white"
                      onClick={() => {
                        setSelectedClient(client);
                        setShowModal(true);
                      }}
                    >
                      <IoIosAddCircleOutline /> Add Pets
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

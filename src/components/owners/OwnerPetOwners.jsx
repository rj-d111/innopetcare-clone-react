import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { db } from "../../firebase";
import { IoIosAddCircleOutline } from "react-icons/io";
import { collection, getDocs, query, where } from "firebase/firestore";
import OwnerPetsModal from "./OwnerPetsModal";
import { FaEye, FaSearch } from "react-icons/fa";

export default function OwnerPetOwners() {
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize navigate
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch clients from Firestore
  useEffect(() => {
    const fetchClients = async () => {
      const clientsCollection = collection(db, "clients");
      const q = query(
        clientsCollection, 
        where("projectId", "==", id), 
        where("status", "==", "approved")
      );
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

  // Filter clients based on search query
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercasedQuery) ||
        client.email.toLowerCase().includes(lowercasedQuery) ||
        client.phone.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

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

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Pet Owners</h2>

        <div className="join">
          <input
            className="input input-bordered join-item w-72"
            placeholder="Search by name, email, or phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn join-item rounded-r-full">
            <FaSearch />
          </button>
        </div>
      </div>

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
                      className="btn btn-success btn-sm text-white mr-3"
                      onClick={() => {
                        setSelectedClient(client);
                        setShowModal(true);
                      }}
                    >
                      <IoIosAddCircleOutline /> Add Pets
                    </button>
                    <button
                      className="btn btn-primary btn-sm text-white"
                      onClick={() => navigate(`${client.id}`)} // Navigate to details page
                    >
                      <FaEye /> View Details
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

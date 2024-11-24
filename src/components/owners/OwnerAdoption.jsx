import React, { useEffect, useState } from "react";
import { IoIosAddCircleOutline, IoMdFemale, IoMdMale } from "react-icons/io";
import OwnerAdoptionModal from "./OwnerAdoptionModal";
import OwnerAdoptionModalDelete from "./OwnerAdoptionModalDelete";
import OwnerAdoptionModalEdit from "./OwnerAdoptionModalEdit";
import { useNavigate, useParams } from "react-router-dom";
import { FaRegEye, FaSearch } from "react-icons/fa";
import { db } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { toast } from "react-toastify";

export default function OwnerAdoption() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adoptions, setAdoptions] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUid, setEditUid] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const closeEditModal = () => setIsEditModalOpen(false);

  // Fetch adoption data from Firebase
  useEffect(() => {
    if (!id) return;

    const animalsRef = collection(db, `adoptions/${id}/animals`);

    // Set up a Firestore listener
    const unsubscribe = onSnapshot(
      animalsRef,
      (snapshot) => {
        const adoptionData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdoptions(adoptionData);
      },
      (error) => {
        console.error("Error fetching adoptions: ", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [id]);


  // Callback to add new pet after submission
  const addPetToList = (newPet) => {
    setAdoptions((prevAdoptions) => [...prevAdoptions, newPet]);
  };

  // Handle view details click
  const handleViewDetails = (uid) => {
    navigate(`${uid}`);
  };

  // Handle Edit action
  const handleEdit = (uid) => {
    setEditUid(uid);
    setIsEditModalOpen(true);
  };

  // Handle Archive action
  const handleArchive = async (uid) => {
    try {
      // Reference the document in the animals subcollection
      const adoptionDoc = doc(db, `adoptions/${id}/animals`, uid);
      await updateDoc(adoptionDoc, { isArchive: true });
  
      // Update state
      setAdoptions((adoptions) =>
        adoptions.map((adoption) =>
          adoption.id === uid ? { ...adoption, isArchive: true } : adoption
        )
      );
  
      toast.success("Pet successfully archived");
    } catch (error) {
      console.error("Error archiving adoption: ", error);
      toast.error("Error archiving adoption");
    }
  };
  

  // Handle Restore action
  const handleRestore = async (uid) => {
    try {
      // Reference the document in the animals subcollection
      const adoptionDoc = doc(db, `adoptions/${id}/animals`, uid);
      await updateDoc(adoptionDoc, { isArchive: false });
  
      // Update state
      setAdoptions((adoptions) =>
        adoptions.map((adoption) =>
          adoption.id === uid ? { ...adoption, isArchive: false } : adoption
        )
      );
  
      toast.success("Pet successfully restored");
    } catch (error) {
      console.error("Error restoring adoption: ", error);
      toast.error("Error restoring adoption");
    }
  };
  

  // Handle Delete action
  const handleDelete = (uid, petName) => {
    setDeleteData({ uid, petName });
    setIsDeleteModalOpen(true);
  };

  // Filter by archived status and search query
  const filteredAdoptions = adoptions.filter((adoption) => {
    const matchesSearch =
      adoption.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adoption.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adoption.breed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArchived = showArchived ? adoption.isArchive === true : adoption.isArchive !== true;
    return matchesSearch && matchesArchived;
  });

  return (
    <div className="p-6">
      <h1 className="font-semibold text-4xl mb-4">Pet Adoption</h1>

      {/* Checkbox to toggle archived view */}
      <div className="flex justify-between">
        <div className="flex items-center my-4">
          <input
            type="checkbox"
            className="toggle toggle-warning"
            checked={showArchived}
            onChange={() => setShowArchived(!showArchived)}
          />
          <label className="ml-2">Show Adopted</label>
        </div>

        {/* Search Bar */}
        <div className="join">
          <input
            className="input input-bordered join-item w-72"
            placeholder="Search by name, species, or breed"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn join-item rounded-r-full">
            <FaSearch />
          </button>
        </div>
      </div>

      <button className="btn btn-success btn-sm text-white" onClick={openModal}>
        <IoIosAddCircleOutline /> Add Pets
      </button>

      {/* Add Modal */}
      {isModalOpen && (
        <OwnerAdoptionModal projectId={id} closeModal={closeModal} addPetToList={addPetToList} />
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && deleteData && (
        <OwnerAdoptionModalDelete projectId={id} uid={deleteData.uid} petName={deleteData.petName} closeDeleteModal={closeDeleteModal} />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editUid && (
        <OwnerAdoptionModalEdit projectId={id} uid={editUid} closeModal={closeEditModal} />
      )}

      <div className="overflow-x-auto mt-4">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Birth Date</th>
              <th>Species</th>
              <th>Breed</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdoptions.length > 0 ? (
              filteredAdoptions.map((adoption) => (
                <tr key={adoption.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-12 w-12">
                          <img src={adoption.image} alt={adoption.petName} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{adoption.petName}</div>
                        <div className="text-sm">
                          {adoption.gender === "male" ? <IoMdMale className="text-blue-700" /> : <IoMdFemale className="text-pink-700" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{adoption.birthdate}</td>
                  <td>{adoption.species}</td>
                  <td>{adoption.breed}</td>
                  <td>
                    <button
                      className="flex items-center space-x-1 text-blue-500 hover:text-blue-700"
                      onClick={() => handleViewDetails(adoption.id)}
                    >
                      <FaRegEye /> <span>View Details</span>
                    </button>
                  </td>
                  <td>
                    <select
                      onChange={(e) => {
                        if (e.target.value === "edit") handleEdit(adoption.id);
                        if (e.target.value === "archive") adoption.isArchive ? handleRestore(adoption.id) : handleArchive(adoption.id);
                        if (e.target.value === "delete") handleDelete(adoption.id, adoption.petName);
                        e.target.value = ""; // Reset dropdown value after selection
                      }}
                      defaultValue=""
                      className="select select-sm"
                    >
                      <option disabled value="">
                        Actions
                      </option>
                      <option value="edit">Edit</option>
                      <option value="archive">{adoption.isArchive ? "Restore" : "Adopted"}</option>
                      <option value="delete">Delete</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No pets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

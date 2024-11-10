import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import DonateModal from "./DonateModal";
import { TbPencil } from "react-icons/tb";
import { CiTrash } from "react-icons/ci";

export default function Donate() {
  const { id } = useParams(); // Get projectId from the URL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [donations, setDonations] = useState([]); // State for donations list
  const [selectedDonation, setSelectedDonation] = useState(null); // State for selected donation to edit

  useEffect(() => {
    const fetchDonations = async () => {
      const donationsCollectionRef = collection(db, "donations-section", id, "donations");
      const donationSnapshot = await getDocs(donationsCollectionRef);
      const donationsList = donationSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDonations(donationsList);
    };

    fetchDonations();
  }, [id]);

  const handleSaveDonationSite = async (donationSiteData) => {
    try {
      const donationsCollectionRef = collection(db, "donations-section", id, "donations");

      if (selectedDonation) {
        // Update existing donation
        const donationDocRef = doc(donationsCollectionRef, selectedDonation.id);
        await updateDoc(donationDocRef, donationSiteData);
        toast.success("Donation site successfully updated");
        setDonations((prevDonations) =>
          prevDonations.map((donation) =>
            donation.id === selectedDonation.id ? { id: donation.id, ...donationSiteData } : donation
          )
        );
      } else {
        // Add new donation
        const newDocRef = await addDoc(donationsCollectionRef, donationSiteData);
        toast.success("Donation site successfully added");
        setDonations((prevDonations) => [...prevDonations, { id: newDocRef.id, ...donationSiteData }]);
      }

      setIsModalOpen(false);
      setSelectedDonation(null);
    } catch (error) {
      console.error("Error saving donation site:", error);
      toast.error("Failed to save donation site");
    }
  };

  const handleEditClick = (donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (donationId) => {
    try {
      const donationDocRef = doc(db, "donations-section", id, "donations", donationId);
      await deleteDoc(donationDocRef);
      setDonations((prevDonations) => prevDonations.filter((donation) => donation.id !== donationId));
      toast.success("Donation site successfully deleted");
    } catch (error) {
      console.error("Error deleting donation site:", error);
      toast.error("Failed to delete donation site");
    }
  };

  return (
    <>
      <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-screen">
        <div className="bg-yellow-100 p-4 rounded-md">
          <h2 className="text-lg font-semibold">Donation Page</h2>
          <p className="text-sm text-gray-700">
            Manage your donation sites and account details below.
          </p>
        </div>

        {donations.length === 0 ? (
          <div className="bg-white h-40 text-sm text-gray-600 flex items-center justify-center">
            No donations added yet
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {donations.map((donation) => (
              <div key={donation.id} className="p-4 bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{donation.donationSite}</h3>
                  <div className="flex">
                    <TbPencil
                      className="text-blue-600 cursor-pointer"
                      onClick={() => handleEditClick(donation)}
                    />
                    <CiTrash
                      className="text-red-600 cursor-pointer ml-2"
                      onClick={() => handleDeleteClick(donation.id)}
                    />
                  </div>
                </div>
                <p className="text-gray-700">Account Name: {donation.accountName}</p>
                <p className="text-gray-700">Account Number: {donation.accountNumber}</p>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-3 rounded-full font-semibold mt-4 w-full"
          onClick={() => {
            setSelectedDonation(null);
            setIsModalOpen(true);
          }}
        >
          + Add Donation Site
        </button>
      </div>

      {isModalOpen && (
        <DonateModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDonation(null);
          }}
          onSave={handleSaveDonationSite}
          donationData={selectedDonation} // Pass selected donation data for editing
        />
      )}
    </>
  );
}

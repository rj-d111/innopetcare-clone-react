import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Spinner from "../Spinner";

export default function DonateModal({ onClose, onSave, donationData }) {
  const [donationSite, setDonationSite] = useState("");
  const [customDonationSite, setCustomDonationSite] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomSite, setShowCustomSite] = useState(false);

  const donationSites = [
    "Metropolitan Bank and Trust Company (METROBANK)",
    "UnionBank of the Philippines (UBP)",
    "Land Bank of the Philippines",
    "Philippine National Bank (PNB)",
    "Banco de Oro (BDO)",
    "Bank of Commerce",
    "GCash",
    "PayMaya",
    "Others",
  ];

  useEffect(() => {
    if (donationData) {
      const { donationSite, accountName, accountNumber } = donationData;
      setAccountName(accountName);
      setAccountNumber(accountNumber);

      if (donationSites.includes(donationSite)) {
        setDonationSite(donationSite);
        setShowCustomSite(false);
      } else {
        setDonationSite("Others");
        setCustomDonationSite(donationSite);
        setShowCustomSite(true);
      }
    }
  }, [donationData]);

  const handleDonationSiteChange = (e) => {
    const selectedSite = e.target.value;
    setDonationSite(selectedSite);
    setShowCustomSite(selectedSite === "Others");
    if (selectedSite !== "Others") {
      setCustomDonationSite("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const donationSiteData = {
      donationSite: showCustomSite ? customDonationSite : donationSite,
      accountName,
      accountNumber,
    };

    await onSave(donationSiteData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 md:max-w-md mx-auto bg-white shadow-md rounded-lg space-y-4 relative">
        <IoClose
          className="text-red-600 text-2xl absolute top-4 right-4 cursor-pointer"
          onClick={onClose}
        />
        <h2 className="text-lg font-bold">{donationData ? "Edit Donation Site" : "Add Donation Site"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Donation Site</label>
            <select
              value={donationSite}
              onChange={handleDonationSiteChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="" disabled>Select a donation site</option>
              {donationSites.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>

          {showCustomSite && (
            <div className="mb-4">
              <label className="block text-sm font-medium">Others (please specify)</label>
              <input
                type="text"
                value={customDonationSite}
                onChange={(e) => setCustomDonationSite(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter donation site"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter Account Name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Account Number</label>
            <input
              type="text"
              placeholder="Enter Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex justify-end mt-4">
            {isSaving ? (
              <Spinner />
            ) : (
              <button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-full font-semibold"
              >
                Save Changes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

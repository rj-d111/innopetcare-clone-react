import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import MetrobankLogo from "../../assets/donate/metrobank.png";
import UnionBankLogo from "../../assets/donate/unionbank.png";
import LandBankLogo from "../../assets/donate/landbank.png";
import PNBLogo from "../../assets/donate/pnb.png";
import BDOLogo from "../../assets/donate/bdo.jpg";
import BankCommerceLogo from "../../assets/donate/bankofcommerce.png";
import GCashLogo from "../../assets/donate/gcash.png";
import PayMayaLogo from "../../assets/donate/paymaya.png";
import { FaDonate } from "react-icons/fa";
import { useParams } from "react-router";
import SkeletonLoader from "./SkeletonLoader"; // Import the skeleton loader

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

const iconMap = {
  "Metropolitan Bank and Trust Company (METROBANK)": MetrobankLogo,
  "UnionBank of the Philippines (UBP)": UnionBankLogo,
  "Land Bank of the Philippines": LandBankLogo,
  "Philippine National Bank (PNB)": PNBLogo,
  "Banco de Oro (BDO)": BDOLogo,
  "Bank of Commerce": BankCommerceLogo,
  GCash: GCashLogo,
  PayMaya: PayMayaLogo,
};

export default function ProjectDonateSites() {
  const [donations, setDonations] = useState([]);
  const { slug } = useParams();
  const [projectId, setProjectId] = useState("");
  const [headerColor, setHeaderColor] = useState("");
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch project ID based on slug
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const globalSectionDoc = globalSectionsSnapshot.docs[0];
          const projectId = globalSectionDoc.id;
          setProjectId(projectId);

          // Extract data from the document
          const globalSectionData = globalSectionDoc.data();
          const headerColor = globalSectionData.headerColor;
          setHeaderColor(headerColor);
        } else {
          console.log("No matching global-sections document found for slug:", slug);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    if (slug) {
      fetchProjectData();
    }
  }, [slug]);

  // Fetch donations from Firestore
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true); // Start loading
      try {
        const donationsRef = collection(
          db,
          `donations-section/${projectId}/donations`
        );
        const snapshot = await getDocs(donationsRef);
        const fetchedDonations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonations(fetchedDonations);
      } catch (error) {
        console.error("Error fetching donations:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (projectId) {
      fetchDonations();
    }
  }, [projectId]);

  // Group donations by site
  const groupedDonations = donations.reduce((acc, donation) => {
    if (!acc[donation.donationSite]) {
      acc[donation.donationSite] = [];
    }
    acc[donation.donationSite].push(donation);
    return acc;
  }, {});



  return (
    <div className="max-w-4xl mx-auto px-4">

      <h1 className="font-bold text-center text-4xl my-8">Donation Sites</h1>

        {loading && <SkeletonLoader />}
        {loading && <SkeletonLoader />}


      <div className="space-y-6">
        {Object.keys(groupedDonations).map((site) => (
          <div
            key={site}
            className="bg-gray-100 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            {/* Container for the donation site */}
            <div className="flex items-start space-x-4 mb-4">
              {/* Render the donation site icon */}
              <div className="flex-shrink-0">
                {iconMap[site] ? (
                  <img src={iconMap[site]} alt={site} className="w-12 h-12" />
                ) : (
                  <FaDonate size={48} style={{ color: headerColor }} />
                )}
              </div>

              {/* Donation site title and account details */}
              <div className="flex flex-col">
                <h4 className="font-semibold text-lg mb-2">{site}</h4>

                {/* Render each account for the donation site */}
                {groupedDonations[site].map((donation) => (
                  <div key={donation.id} className="mb-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Account Name:</span>{" "}
                      {donation.accountName}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Account Number:</span>{" "}
                      {donation.accountNumber}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

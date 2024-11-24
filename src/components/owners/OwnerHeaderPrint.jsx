import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const OwnerHeaderPrint = ({projectId, title= "Pet Health Record"}) => {
  const [vetInfo, setVetInfo] = useState(null);

  useEffect(() => {
    const fetchVetInfo = async () => {
      if (projectId) {
        try {
          const vetDocRef = doc(db, "global-sections", projectId);
          const vetDoc = await getDoc(vetDocRef);

          if (vetDoc.exists()) {
            setVetInfo(vetDoc.data());
          }
        } catch (error) {
          console.error("Error fetching veterinarian site information:", error);
        }
      }
    };

    fetchVetInfo();
  }, );

  if (!vetInfo) return null;

  return (
    <div className="mb-8 print:mb-4 print:block hidden">
      <nav className="flex items-start p-4">
        {vetInfo.image && (
          <img
            src={vetInfo.image}
            alt={vetInfo.name}
            className="w-20 h-20 object-cover rounded-full mr-6"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{vetInfo.name}</h2>
          <p className="text-gray-600">{vetInfo.address}</p>
        </div>
      </nav>
      {/* Pet Health Records Heading */}
      <h1
        className="text-3xl font-bold mb-6 print:mb-0 print:text-center"
        style={{ color: vetInfo.headerColor }}
      >
        {title}
      </h1>
    </div>
  );
};

export default OwnerHeaderPrint;

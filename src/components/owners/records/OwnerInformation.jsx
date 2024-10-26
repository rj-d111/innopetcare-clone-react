import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase'; // Adjust the import based on your folder structure
import { doc, getDoc } from 'firebase/firestore';
import Spinner from '../../Spinner';

const OwnerInformation = ({ clientId }) => {
  const [ownerInfo, setOwnerInfo] = useState(null); // State to store owner's information
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    const fetchOwnerInfo = async () => {
      try {
        // Reference to the specific client document based on clientId
        const clientDocRef = doc(db, 'clients', clientId);
        const clientDoc = await getDoc(clientDocRef);

        if (clientDoc.exists()) {
          setOwnerInfo(clientDoc.data()); // Store the owner's information
        } else {
          console.error('No such client found!');
        }
      } catch (error) {
        console.error('Error fetching owner information: ', error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    if (clientId) {
      fetchOwnerInfo(); // Fetch owner info if clientId is provided
    }
  }, [clientId]);

  if (loading) {
    return <Spinner />; // Show loading message while fetching data
  }

  if (!ownerInfo) {
    return <p>No owner information available.</p>; // Show message if no owner info
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
      <h3 className="text-xl font-bold mb-4">Pet Owner Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Name:</p>
          <p>{ownerInfo.name}</p> {/* Display owner's name */}
        </div>
        <div>
          <p className="font-semibold">Email:</p>
          <p>{ownerInfo.email}</p> {/* Display owner's email */}
        </div>
        <div>
          <p className="font-semibold">Contact No:</p>
          <p>{ownerInfo.phone}</p> {/* Display owner's phone number */}
        </div>
      </div>
    </div>
  );
};

export default OwnerInformation;

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase'; // Adjust based on your Firebase setup
import { collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import required functions
import { toast } from 'react-toastify';

export default function Donate() {
  const { id } = useParams(); // Get projectId from the URL
  const [formData, setFormData] = useState({
    donationSite: 'Land Bank of the Philippines', // Set default donation site
    accountName: '',
    accountNumber: '',
    pictures: [],
  });
  const storage = getStorage();

  const [documentExists, setDocumentExists] = useState(false); // Manage document state

  const donationSites = [
    'Metropolitan Bank and Trust Company (METROBANK)',
    'UnionBank of the Philippines (UBP)',
    'Land Bank of the Philippines',
    'Philippine National Bank (PNB)',
    'Banco de Oro (BDO)',
    'Bank of Commerce',
  ];

  // Handle input changes
  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'pictures') {
      setFormData({ ...formData, pictures: Array.from(files) }); // Handle multiple file inputs
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit the form
  const onSubmit = async () => {
    if (formData.donationSite && formData.accountName && formData.accountNumber && formData.pictures.length > 0) {
      try {
        const donationsRef = collection(db, 'donations');

        // Prepare the image upload promises
        const imageUploadPromises = formData.pictures.map(async (picture) => {
          const storageRef = ref(storage, `donation-images/${picture.name}`); // Use ref to create a reference
          await uploadBytes(storageRef, picture); // Upload each image to Firebase Storage
          return getDownloadURL(storageRef); // Get the image URL
        });

        // Wait for all images to upload and get their URLs
        const pictureUrls = await Promise.all(imageUploadPromises);

        // Add document to Firestore
        await addDoc(donationsRef, {
          ...formData,
          pictures: pictureUrls, // Add image URLs to document
          projectId: id, // Include the projectId
        });

        // Reset form or update state as needed
        setFormData({ donationSite: 'Land Bank of the Philippines', accountName: '', accountNumber: '', pictures: [] });
        setDocumentExists(true);
        toast.success('Donation data saved successfully!'); // Show success message
      } catch (error) {
        console.error('Error uploading donation data: ', error);
        toast.error('Error uploading donation data: ' + error.message); // Include the error message
      }
    } else {
      toast.error('Please fill in all fields and select at least one picture.'); // Basic validation
    }
  };

  return (
    <div className="p-6 md:max-w-md mx-auto bg-gray-100 shadow-md rounded-lg space-y-4 min-h-screen">
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Donate Page</h2>
        <p className="text-sm text-gray-700">
          A donate page is a section of a website dedicated to facilitating financial contributions from individuals who want to support a particular cause, organization, or project.
        </p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Donation Site</label>
        <select
          name="donationSite"
          value={formData.donationSite}
          onChange={onChange}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          required
        >
          {donationSites.map((site) => (
            <option key={site} value={site}>
              {site}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Account Name</label>
        <input
          type="text"
          id="accountName"
          name="accountName"
          value={formData.accountName}
          onChange={onChange}
          placeholder="Enter account name here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Account Number</label>
        <input
          type="text"
          id="accountNumber"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={onChange}
          placeholder="Enter account number here"
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition ease-in-out"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Upload Pictures</label>
        <input
          type="file"
          accept="image/*"
          name="pictures"
          multiple // Allow multiple file uploads
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-yellow-300"
          required
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className={`w-full uppercase py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:shadow-lg ${
          documentExists
            ? 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800'
            : 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800'
        } text-white`}
      >
        {documentExists ? 'Update Changes' : 'Save Donation'}
      </button>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaGlobe, FaFacebook, FaInstagram } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function ProjectCommunityForumDetails({ projectId }) {
  const [globalSection, setGlobalSection] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch global section data
  useEffect(() => {
    const fetchGlobalSection = async () => {
      try {
        const globalSectionRef = doc(db, "global-sections", projectId);
        const globalSectionSnap = await getDoc(globalSectionRef);
        if (globalSectionSnap.exists()) {
          setGlobalSection(globalSectionSnap.data());
        } else {
          console.error("Global section not found.");
        }
      } catch (error) {
        console.error("Error fetching global section:", error);
      }
    };

    fetchGlobalSection();
  }, [projectId]);

  // Fetch contact-sections data
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contactsRef = collection(
          db,
          `contact-sections/${projectId}/sections`
        );
        const snapshot = await getDocs(contactsRef);
        const fetchedContacts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(fetchedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchContacts();
    }
  }, [projectId]);

  // Group contacts by type
  const groupedContacts = contacts.reduce((acc, contact) => {
    if (!acc[contact.type]) {
      acc[contact.type] = [];
    }
    acc[contact.type].push(contact);
    return acc;
  }, {});

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="w-full lg:w-1/4 bg-white shadow-md rounded-lg p-6 space-y-6">
      {globalSection && (
        <div className="text-center">
          {/* Avatar */}
          {globalSection.image && (
            <img
              src={globalSection.image}
              alt={globalSection.name || "Owner"}
              className="rounded-full w-24 h-24 mx-auto object-cover"
            />
          )}
          {/* Name */}
          <h3 className="text-xl font-semibold mt-4">{globalSection.name}</h3>
          {/* Location */}
          {globalSection.address && (
            <p className="text-sm text-gray-600">{globalSection.address}</p>
          )}
        </div>
      )}

      {/* Contacts */}
      <div>
        <h4 className="text-lg font-semibold border-b pb-2 mb-4">Contacts</h4>
        {groupedContacts.phone &&
          groupedContacts.phone.map((contact) => (
            <div key={contact.id} className="flex items-center mb-2">
              <FaPhone className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">{contact.content}</span>
            </div>
          ))}
        {groupedContacts.email &&
          groupedContacts.email.map((contact) => (
            <div key={contact.id} className="flex items-center mb-2">
              <FaEnvelope className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">{contact.content}</span>
            </div>
          ))}
      </div>

      {/* Social Media */}
      <div>
        <h4 className="text-lg font-semibold border-b pb-2 mb-4">
          Social Media Sites
        </h4>
        {groupedContacts.facebook &&
          groupedContacts.facebook.map((contact) => (
            <div key={contact.id} className="mb-2 flex items-center">
              <span className="mr-2 text-blue-500"><FaFacebook /></span>
              <a
                href={
                  contact.content.startsWith("http://") ||
                  contact.content.startsWith("https://")
                    ? contact.content
                    : `https://${contact.content}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {contact.content}
              </a>
            </div>
          ))}
        {groupedContacts.instagram &&
          groupedContacts.instagram.map((contact) => (
            <div key={contact.id} className="mb-2 flex items-center">
              <span className="mr-2 text-blue-500"><FaInstagram /></span>
              <a
                href={
                  contact.content.startsWith("http://") ||
                  contact.content.startsWith("https://")
                    ? contact.content
                    : `https://${contact.content}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-500 hover:underline"
              >
                {contact.content}
              </a>
            </div>
          ))}
        {groupedContacts.twitter &&
          groupedContacts.twitter.map((contact) => (
            <div key={contact.id} className="mb-2 flex items-center">
              <span className="mr-2 text-blue-500"><FaSquareXTwitter /></span>
              <a
                href={
                  contact.content.startsWith("http://") ||
                  contact.content.startsWith("https://")
                    ? contact.content
                    : `https://${contact.content}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {contact.content}
              </a>
            </div>
          ))}
      </div>

      {/* Other Locations */}
      <div>
        <h4 className="text-lg font-semibold border-b pb-2 mb-4">
          Other Locations
        </h4>
        {groupedContacts.address &&
          groupedContacts.address.map((contact) => (
            <div key={contact.id} className="flex items-center mb-2">
              <FaMapMarkerAlt className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">{contact.content}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

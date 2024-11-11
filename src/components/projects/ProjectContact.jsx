import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import {
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaFacebookMessenger,
  FaYoutube,
  FaTwitter,
  FaInstagram,
  FaReddit,
  FaTiktok,
  FaLinkedin,
  FaWhatsapp,
  FaTelegramPlane,
  FaViber,
  FaMapMarkerAlt,
  FaGlobe,
  FaQuestionCircle,
} from "react-icons/fa";
import { useParams } from "react-router";
import { TbDeviceLandlinePhone } from "react-icons/tb";
import SkeletonLoader from "./SkeletonLoader";
import ProjectFooter from "./ProjectFooter";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import customMarker from "../design/customMarker";

const iconMap = {
  phone: <FaPhone />,
  landline: <TbDeviceLandlinePhone />,
  email: <FaEnvelope />,
  address: <FaMapMarkerAlt />,
  facebook: <FaFacebook />,
  messenger: <FaFacebookMessenger />,
  youtube: <FaYoutube />,
  x: <FaTwitter />,
  instagram: <FaInstagram />,
  reddit: <FaReddit />,
  tiktok: <FaTiktok />,
  linkedin: <FaLinkedin />,
  whatsapp: <FaWhatsapp />,
  viber: <FaViber />,
  telegram: <FaTelegramPlane />,
  others: <FaQuestionCircle />,
};

const ProjectContact = () => {
  const [contacts, setContacts] = useState([]);
  const { slug } = useParams();
  const [projectId, setProjectId] = useState("");
  const [headerColor, setHeaderColor] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch project ID based on slug
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const globalSectionsQuery = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const globalSectionsSnapshot = await getDocs(globalSectionsQuery);

        if (!globalSectionsSnapshot.empty) {
          const globalSectionDoc = globalSectionsSnapshot.docs[0];
          const projectId = globalSectionDoc.id;
          const globalSectionData = globalSectionDoc.data();
          setProjectId(projectId);
          setHeaderColor(globalSectionData.headerColor || "");
        } else {
          console.log(
            "No matching global-sections document found for slug:",
            slug
          );
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProjectData();
    }
  }, [slug]);

  // Fetch contacts from Firestore
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

  // Filter out address contacts with coordinates
  const addressContactsWithCoordinates = contacts.filter(
    (contact) =>
      contact.type === "address" &&
      contact.location?.latitude &&
      contact.location?.longitude
  );

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-bold text-center text-4xl my-8">Contact Us</h1>
        {loading && <SkeletonLoader />}
        <div className="space-y-6">
          {Object.keys(groupedContacts).map((type) => (
            <div
              key={type}
              className="bg-gray-100 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-4" style={{ color: headerColor }}>
                  {iconMap[type] || <FaGlobe />}
                </div>
                <div className="flex flex-col flex-grow">
                  <h4 className="font-semibold text-base capitalize">{type}</h4>
                  {groupedContacts[type].map((contact) => (
                    <p key={contact.id} className="text-sm text-gray-700">
                      {contact.content}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Display maps for address contacts with coordinates */}
      {addressContactsWithCoordinates.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-12">
          <h2 className="text-2xl font-bold mb-4">Our Locations</h2>
          {addressContactsWithCoordinates.map((contact) => (
            <div key={contact.id} className="mb-8">
              <h3 className="font-semibold text-lg">{contact.content}</h3>
              <div className="relative z-0">
                <MapContainer
                  center={[
                    contact.location.latitude,
                    contact.location.longitude,
                  ]}
                  zoom={15}
                  className="h-[300px] w-full mt-4 rounded-lg"
                  style={{ zIndex: 0 }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[
                      contact.location.latitude,
                      contact.location.longitude,
                    ]}
                    icon={customMarker}
                  />
                </MapContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-6"></div>
      <ProjectFooter />
    </div>
  );
};

export default ProjectContact;

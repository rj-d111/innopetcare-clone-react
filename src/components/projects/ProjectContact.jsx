import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaPhone, FaEnvelope, FaFacebook, FaFacebookMessenger, FaYoutube, FaTwitter, FaInstagram, FaReddit, FaTiktok, FaLinkedin, FaWhatsapp, FaTelegramPlane, FaViber, FaMapMarkerAlt, FaGlobe, FaQuestionCircle } from 'react-icons/fa';
import { useParams } from 'react-router';
import { TbDeviceLandlinePhone } from "react-icons/tb";
import SkeletonLoader from './SkeletonLoader';
import ProjectFooter from './ProjectFooter';

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
  others: <FaQuestionCircle />
};

const ProjectContact = () => {
  const [contacts, setContacts] = useState([]);
  const { slug } = useParams();
  const [projectId, setProjectId] = useState("");
  const [headerColor, setHeaderColor] = useState("");
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch project ID based on slug
  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true); // Start loading
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
          
                    // Set the projectId and headerColor in state
                    setProjectId(projectId);
                    if (headerColor) {
                      setHeaderColor(headerColor);
                    }
        } else {
          console.log("No matching global-sections document found for slug:", slug);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }finally{
        setLoading(false); // Start loading

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
        const contactsRef = collection(db, `contact-sections/${projectId}/sections`);
        const snapshot = await getDocs(contactsRef);
        const fetchedContacts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(fetchedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
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

  return (
      <div>
        <div className='max-w-4xl mx-auto px-4'>
          <h1 className='font-bold text-center text-4xl my-8'>Contact Us</h1>
          {loading && <SkeletonLoader />}
          {loading && <SkeletonLoader />}
          <div className="space-y-6">
            {Object.keys(groupedContacts).map((type) => (
              <div
                key={type}
                className="bg-gray-100 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Container for the icon, type, and content */}
                <div className="flex items-center">
                  {/* Render the icon based on the contact type */}
                  <div className="text-2xl mr-4" style={{ color: headerColor }}>
                    {iconMap[type] || <FaGlobe />}
                  </div>
                  {/* Render the type and content on the right side */}
                  <div className="flex flex-col flex-grow">
                    <h4 className="font-semibold text-base capitalize">{type}</h4>
                    {groupedContacts[type].map(contact => (
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
        <div className="mb-6"></div>
        <ProjectFooter />
      </div>
    );
  };
  
  export default ProjectContact;
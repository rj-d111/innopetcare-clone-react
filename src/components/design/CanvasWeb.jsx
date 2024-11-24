import { FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { useParams } from "react-router";

const CanvasWeb = ({ formData, imagePreview, sections }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isCommunityForumEnabled, setIsCommunityForumEnabled] = useState(true);
  const [isAppointmentsEnabled, setIsAppointmentsEnabled] = useState(true);
  const db = getFirestore();
  const { id } = useParams();

  useEffect(() => {
    // Fetch Appointments Section
    const appointmentsRef = doc(db, "appointments-section", id);
    const unsubscribeAppointments = onSnapshot(
      appointmentsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const sectionData = snapshot.data();
          setIsAppointmentsEnabled(sectionData.isEnabled);
        } else {
          console.warn(
            "Appointments section not found. Defaulting to enabled."
          );
          setIsAppointmentsEnabled(true); // Default to true if the document doesn't exist
        }
      },
      (error) => {
        console.error("Error listening to appointments section:", error);
      }
    );

    // Fetch Community Forum Section
    const communityForumRef = doc(db, "community-forum-section", id);
    const unsubscribeCommunityForum = onSnapshot(
      communityForumRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const sectionData = snapshot.data();
          setIsCommunityForumEnabled(sectionData.isEnabled);
        } else {
          console.warn(
            "Community Forum section not found. Defaulting to enabled."
          );
          setIsCommunityForumEnabled(true); // Default to true if the document doesn't exist
        }
      },
      (error) => {
        console.error("Error listening to community forum section:", error);
      }
    );

    // Cleanup subscriptions on component unmount
    return () => {
      unsubscribeAppointments();
      unsubscribeCommunityForum();
    };
  }, [db, id]);

  // ScrollCarousel function
  const scrollCarousel = (direction, sectionId) => {
    const carousel = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (carousel) {
      const scrollAmount = carousel.offsetWidth; // Amount to scroll
      carousel.scrollBy({
        left: direction * scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="grow mockup-browser border-base-300 border max-w-full">
        {/* Toolbar */}
        <div className="mockup-browser-toolbar">
          <div className="input border-base-300 border">
            https://innopetcare.com/sites/{formData.slug || ""}
          </div>
        </div>

        {/* Navigation Bar */}
        <nav
          className="flex items-center justify-between py-4 sticky text-sm px-5"
          style={{
            background: formData.headerColor || "#1e88e5",
            color: formData.headerTextColor || "#ffffff",
          }}
        >
          {/* Logo Section */}
          <div className="flex items-center space-x-6">
            {(imagePreview || formData.logoPicture) && (
              <img
                src={imagePreview || formData.logoPicture}
                alt="Uploaded Logo"
                className="h-8"
              />
            )}
            <p>{formData.name || "Default Project Name"}</p>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <ul className="flex items-center space-x-6">
              <li>About Us</li>
              {isAppointmentsEnabled && <li>Appointments</li>}
              {isCommunityForumEnabled && <li>Community Forum</li>}
              <li>Contact Us</li>
            </ul>

            {/* Profile Section */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <FaUserCircle className="text-3xl cursor-pointer" />
              {isDropdownOpen && (
                <ul className="absolute right-0 z-10 bg-white shadow-lg p-2 rounded-lg">
                  <li className="p-2 cursor-pointer hover:bg-gray-100">
                    Dashboard
                  </li>
                  <li className="p-2 cursor-pointer hover:bg-gray-100">
                    Edit Profile
                  </li>
                  <li className="p-2 cursor-pointer hover:bg-gray-100">
                    Sign Out
                  </li>
                </ul>
              )}
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto md:max-w-2xl 2xl:max-w-full flex-grow mx-auto">
          {sections.map((section) => (
            <div key={section.id} className="mb-5 p-5 text-center">
              <h3 className="text-xl font-bold">{section.sectionTitle}</h3>
              <p className="text-gray-600">{section.sectionSubtext}</p>
              <p className="text-sm mb-4">{section.sectionContent}</p>
              {section.sectionImages && section.sectionImages.length > 0 && (
                <>
                  {section.sectionType === "carousel" ? (
                    <div className="relative">
                      {/* Carousel */}
                      <div
                        className="flex overflow-x-scroll no-scrollbar"
                        data-section-id={section.id}
                      >
                        {section.sectionImages.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Image ${index + 1}`}
                            className="w-full h-40 object-cover rounded-md flex-shrink-0"
                            style={{ minWidth: "100%" }}
                          />
                        ))}
                      </div>

                      {/* Left Arrow */}
                      <button
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full"
                        onClick={() => scrollCarousel(-1, section.id)}
                      >
                        &lt;
                      </button>

                      {/* Right Arrow */}
                      <button
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white p-2 rounded-full"
                        onClick={() => scrollCarousel(1, section.id)}
                      >
                        &gt;
                      </button>
                    </div>
                  ) : section.sectionType === "grid" ? (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {/* Grid */}
                      {section.sectionImages.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-40 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CanvasWeb;

import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";

const CanvasWeb = ({ formData, imagePreview, homeSections }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

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
              <li>Services</li>
              <li>Appointments</li>
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

        {/* Content Area with max width of 560px */}
        <div className="p-5 overflow-y-auto md:max-w-2xl 2xl:max-w-full  flex-grow mx-auto">
          {homeSections.map((section) => (
            <div
              key={section.id}
              className="mb-5 p-5 text-center"
            >
              <h3 className="text-xl font-bold">{section.sectionTitle}</h3>
              <p className="text-gray-600">{section.sectionSubtext}</p>
              <p className="text-sm mb-4">{section.sectionContent}</p>
              {section.sectionImages && section.sectionImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {section.sectionImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CanvasWeb;

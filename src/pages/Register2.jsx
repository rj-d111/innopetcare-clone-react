import React, { useState } from "react";
import { toast } from "react-toastify";
import zipcodes from "./philippineZipcodes.js";
import { FaSearch } from "react-icons/fa";
import Spinner from "../components/Spinner.jsx";

function Register2({ formData, onChange, onPrevious, onNext }) {
  const [filteredCities, setFilteredCities] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };

  const handleCityChange = (e) => {
    const cityInput = e.target.value;
    handleInputChange("city", cityInput);

    // Filter and sort suggestions based on input
    const suggestions = Object.entries(zipcodes)
      .flatMap(([code, city]) =>
        Array.isArray(city)
          ? city.map((subCity) => ({ name: subCity, postalCode: code }))
          : [{ name: city, postalCode: code }]
      )
      .filter((city) =>
        city.name.toLowerCase().includes(cityInput.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    setFilteredCities(suggestions);
    setShowSuggestions(true);
    setHighlightedIndex(-1);

    if (suggestions.length === 0) {
      handleInputChange("postalCode", "");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      "firstName",
      "lastName",
      "legalName",
      "businessRegNumber",
      "city",
      "postalCode",
    ];
    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      emptyFields.forEach((field) => {
        const fieldName = field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        toast.error(`${fieldName} is required.`);
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      onNext();
      setIsLoading(false);
      toast.success("Step 2 completed successfully!");
    }, 1500); // Simulate loading for demonstration
  };

  const handleCitySelect = (selectedCity) => {
    handleInputChange("city", selectedCity.name);
    handleInputChange("postalCode", selectedCity.postalCode);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        setHighlightedIndex((prevIndex) =>
          prevIndex < filteredCities.length - 1 ? prevIndex + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        setHighlightedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : filteredCities.length - 1
        );
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        handleCitySelect(filteredCities[highlightedIndex]);
        e.preventDefault();
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold mb-4">Business Information</h3>

        <div className="mb-5">
          <label htmlFor="firstName" className="block text-gray-500 mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName || ""}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="Enter your first name"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="lastName" className="block text-gray-500 mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName || ""}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Enter your last name"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="legalName" className="block text-gray-500 mb-2">
            Legal Name/Company Name
          </label>
          <input
            type="text"
            id="legalName"
            value={formData.legalName || ""}
            onChange={(e) => handleInputChange("legalName", e.target.value)}
            placeholder="Enter your legal/company name"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="mb-5">
          <label
            htmlFor="businessRegNumber"
            className="block text-gray-500 mb-2"
          >
            Business Registration Number
          </label>
          <input
            type="text"
            id="businessRegNumber"
            value={formData.businessRegNumber || ""}
            onChange={(e) =>
              handleInputChange("businessRegNumber", e.target.value)
            }
            placeholder="Enter your business registration number"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <h3 className="text-lg font-semibold mb-4">Billing Address</h3>

        <div className="mb-5 relative">
          <label htmlFor="city" className="block text-gray-500 mb-2">
            City/Town
          </label>
          <div className="relative w-full">
            <input
              type="text"
              id="city"
              value={formData.city || ""}
              onChange={handleCityChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Type your city here"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10"
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>
          {showSuggestions && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto">
              {filteredCities.length > 0 ? (
                filteredCities.map((city, index) => (
                  <li
                    key={index}
                    onMouseDown={() => handleCitySelect(city)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-4 py-2 cursor-pointer flex justify-between ${
                      index === highlightedIndex ? "bg-yellow-100" : ""
                    }`}
                  >
                    <span>{city.name}</span>
                    <span className="text-gray-500">{city.postalCode}</span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">
                  No city found. You can type your own.
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="postalCode" className="block text-gray-500 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            id="postalCode"
            value={formData.postalCode || ""}
            onChange={(e) => handleInputChange("postalCode", e.target.value)}
            placeholder="Enter your postal code"
            // readOnly={filteredCities.some((city) => city.name === formData.city)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
          >
            Back
          </button>
          <button
            type="submit"
            className={`text-white px-4 py-2 rounded-lg flex items-center ${
              isLoading ? "bg-gray-400" : "bg-yellow-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner />{" "}
                {/* Assuming Spinner is an icon or loading component */}
                <span>Please wait...</span>
              </>
            ) : (
              "Next"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default Register2;

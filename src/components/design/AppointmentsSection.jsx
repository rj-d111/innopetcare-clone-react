import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import Spinner from "../Spinner";
import { FaTrash } from "react-icons/fa";
import { GoBlocked } from "react-icons/go";

const timeIntervals = () => {
  const times = [];
  let start = new Date();
  start.setHours(0, 0, 0, 0); // Start at 12:00 AM
  for (let i = 0; i < 48; i++) {
    const hours24 = start.getHours(); // 24-hour format
    const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24; // Convert to 12-hour format
    const minutes = start.getMinutes().toString().padStart(2, "0"); // Always two digits
    const period = hours24 < 12 ? "AM" : "PM"; // AM/PM marker

    times.push({
      value: `${hours24}:${minutes}`, // 24-hour format for backend
      label: `${hours12}:${minutes} ${period}`, // 12-hour format for frontend
    });

    start.setMinutes(start.getMinutes() + 30); // Increment by 30 minutes
  }
  return times;
};

export default function AppointmentsSection() {
  const { id } = useParams();
  const db = getFirestore();

  const [isEnabled, setIsEnabled] = useState(true); // Enabled by default
  const [shouldShowWarning, setShouldShowWarning] = useState(false); // Warning if section not found
  const [documentExists, setDocumentExists] = useState(false); // Track if the document exists
  const [loading, setLoading] = useState(true); // Loading state
  const [disableDaysOfWeek, setDisableDaysOfWeek] = useState([0, 6]);
  const [customSchedules, setCustomSchedules] = useState({});
  const [blockedDays, setBlockedDays] = useState([]);
  const [showDatepicker, setShowDatepicker] = useState(false);
  const times = timeIntervals();

  const dateInputRef = useRef(null); // Reference for the hidden datepicker

  const handleAddDateClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker(); // Show the datepicker programmatically
    }
  };

  const handleAddDate = (date) => {
    if (!blockedDays.includes(date)) {
      setBlockedDays([...blockedDays, date]);
      toast.success(`Date ${date} added successfully.`);
    } else {
      toast.error(`Date ${date} is already blocked.`);
    }
  };

  const handleDeleteDate = (date) => {
    if (window.confirm(`Are you sure you want to delete this date, ${date}?`)) {
      setBlockedDays((prevBlockedDays) =>
        prevBlockedDays.filter((d) => d !== date)
      );
      toast.success(`Date ${date} successfully deleted.`);
    }
  };

  const handleDayToggle = (day) => {
    if (disableDaysOfWeek.includes(day)) {
      // Enable the day by removing it from disableDaysOfWeek
      setDisableDaysOfWeek(disableDaysOfWeek.filter((d) => d !== day));

      // Add an empty object for the day in customSchedules
      setCustomSchedules((prevSchedules) => ({
        ...prevSchedules,
        [daysOfWeek[day]]: prevSchedules[daysOfWeek[day]] || {}, // Retain existing data or set to {}
      }));
    } else {
      // Disable the day by adding it to disableDaysOfWeek
      setDisableDaysOfWeek([...disableDaysOfWeek, day]);

      // Remove the day from customSchedules
      setCustomSchedules((prevSchedules) => {
        const { [daysOfWeek[day]]: _, ...remainingSchedules } = prevSchedules;
        return remainingSchedules;
      });
    }
  };

  // Fetch section data from Firestore
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const sectionRef = doc(db, "appointments-section", id);
        const sectionSnap = await getDoc(sectionRef);

        if (sectionSnap.exists()) {
          const sectionData = sectionSnap.data();
          setIsEnabled(sectionData.isEnabled); // Set the state based on the fetched data
          setDocumentExists(true); // Mark document as existing
          setShouldShowWarning(false); // No warning if the section is found

          // Set customSchedules state from Firebase
          setCustomSchedules(sectionData.customSchedules || {});

          // Set blockedDays state from Firebase
          setBlockedDays(sectionData.blockedDays || []);

          // Set disableDaysOfWeek state from Firebase
          setDisableDaysOfWeek(sectionData.disableDaysOfWeek || []);
        } else {
          setShouldShowWarning(true); // Show warning if the section is not found
        }
      } catch (error) {
        console.error("Error fetching section data:", error);
        setShouldShowWarning(true); // Show warning if an error occurs
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    };

    fetchSectionData();
  }, [id, db]);

  const toggleAppointmentsSection = () => {
    setIsEnabled((prev) => !prev);
  };

  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const validateSchedules = () => {
    // const allDays = Array.from({ length: 7 }, (_, i) => i); // [0, 1, 2, 3, 4, 5, 6]

    // // Find the missing numbers
    // const missingDays = allDays.filter(
    //   (day) => !disableDaysOfWeek.includes(day)
    // );

    // console.log(missingDays); // Output: [1]

    // console.log(customSchedules);

    const daysWithErrors = [];

    for (const day of Object.keys(customSchedules)) {
      const { start, end } = customSchedules[day] || {};
      if (!disableDaysOfWeek.includes(daysOfWeek.indexOf(day))) {
        // Check if either start or end time is missing

        if (!start || !end) {
          daysWithErrors.push(
            `${day.toUpperCase()}: Start and End times are required`
          );
        } else {
          // Check if end time is earlier than start time
          const [startHour, startMinute] = start.split(":").map(Number);
          const [endHour, endMinute] = end.split(":").map(Number);
          const startTime = startHour * 60 + startMinute; // Total minutes
          const endTime = endHour * 60 + endMinute; // Total minutes

          console.log(startTime);
          console.log(endTime);
          if (endTime <= startTime) {
            daysWithErrors.push(`${day}: End time must be after Start time`);
          }
        }
      }
    }

    return daysWithErrors;
  };

  const onSubmit = async () => {
    setLoading(true);

    try {
      const validationErrors = validateSchedules();

      if (validationErrors.length > 0) {
        setLoading(false);
        toast.error(`Validation Error:\n${validationErrors.join("\n")}`);
        return;
      }

      const sectionRef = doc(db, "appointments-section", id);

      const dataToSave = {
        isEnabled,
        customSchedules,
        blockedDays,
        disableDaysOfWeek,
        updatedAt: new Date(),
      };

      await setDoc(sectionRef, dataToSave);

      setDocumentExists(true);
      setShouldShowWarning(false);
      setLoading(false);
      toast.success("Appointments Section saved successfully!");
    } catch (error) {
      console.error("Error saving section data:", error);
      setLoading(false);
      toast.error("Failed to save changes.");
    }
  };

  const onUpdate = async () => {
    setLoading(true);
    try {
      const validationErrors = validateSchedules();

      console.log(customSchedules);

      if (validationErrors.length > 0) {
        setLoading(false);
        toast.error(`Validation Error:\n${validationErrors.join("\n")}`);
        return;
      }

      const sectionRef = doc(db, "appointments-section", id);

      const dataToUpdate = {
        isEnabled,
        customSchedules,
        blockedDays,
        disableDaysOfWeek,
        updatedAt: new Date(),
      };

      await setDoc(sectionRef, dataToUpdate, { merge: true });

      toast.success("Appointments Section updated successfully!");
    } catch (error) {
      console.error("Error updating section data:", error);
      toast.error("Failed to update changes.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <Spinner />
      </div>
    );
  }

  const handleStartTimeChange = (day, value) => {
    setCustomSchedules((prevSchedules) => ({
      ...prevSchedules,
      [day]: {
        ...prevSchedules[day],
        start: value,
      },
    }));
  };

  const handleEndTimeChange = (day, value) => {
    setCustomSchedules((prevSchedules) => ({
      ...prevSchedules,
      [day]: {
        ...prevSchedules[day],
        end: value,
      },
    }));
  };

  const minDate = new Date().toISOString().split("T")[0]; // Minimum date: today

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Section Description */}
      <div className="bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Appointments Section</h2>
        <p className="text-sm text-gray-700">
          The Appointments Section allows you to manage all your scheduled
          appointments efficiently. Enable or disable this section to control
          its visibility.
        </p>
      </div>

      {/* Alerts */}
      <div className="mt-6">
        {shouldShowWarning ? (
          <div role="alert" className="alert alert-warning p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Please configure this Appointments Section and save your changes.
            </span>
          </div>
        ) : (
          <div role="alert" className="alert alert-success p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Appointments Section is successfully configured.</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div className="flex items-center mt-6 mb-6">
        <input
          type="checkbox"
          className="toggle toggle-warning"
          checked={isEnabled}
          onChange={toggleAppointmentsSection}
        />
        <label className="ml-3">Enable Appointments Section</label>
      </div>
      {isEnabled && (
        <div className="py-6">
          {/* Weekdays Schedule */}
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Schedule</h3>
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={!disableDaysOfWeek.includes(idx)}
                  onChange={() => handleDayToggle(idx)}
                  className="checkbox checkbox-primary"
                />
                <label className="ml-2">{day}</label>
                {!disableDaysOfWeek.includes(idx) && (
                  <div className="ml-4">
                    <select
                      value={customSchedules[day.toLowerCase()]?.start || ""}
                      onChange={(e) =>
                        handleStartTimeChange(day.toLowerCase(), e.target.value)
                      }
                    >
                      <option value="" disabled>
                        --Select Time--
                      </option>
                      {timeIntervals().map((time) => (
                        <option key={time.value} value={time.value}>
                          {time.label}
                        </option>
                      ))}
                    </select>

                    <span className="mx-2">to</span>
                    <select
                      value={customSchedules[day.toLowerCase()]?.end || ""}
                      onChange={(e) =>
                        handleEndTimeChange(day.toLowerCase(), e.target.value)
                      }
                    >
                      <option value="" disabled>
                        --Select Time--
                      </option>
                      {timeIntervals().map((time) => (
                        <option key={time.value} value={time.value}>
                          {time.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Blocked Days */}
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">Blocked Dates</h3>
            {/* Button to Trigger Datepicker */}
            <button
              className="btn btn-active bg-red-600 hover:bg-red-700 text-white"
              onClick={handleAddDateClick}
            >
              <GoBlocked /> Add Dates to be Blocked
            </button>

            {/* Hidden Datepicker */}
            <input
              ref={dateInputRef}
              type="date"
              min={minDate} // Disable past dates and today
              onChange={(e) => handleAddDate(e.target.value)}
              className="hidden"
            />
            <ul className="mt-2">
              {blockedDays.length === 0 ? (
                <p>No dates have been blocked yet.</p> // Show this when there are no blocked dates
              ) : (
                blockedDays.map((date, idx) => (
                  <li key={idx} className="flex items-center">
                    <span>{date}</span>
                    <button
                      className="ml-2 text-red-500 flex items-center"
                      onClick={() => handleDeleteDate(date)}
                    >
                      <FaTrash className="mr-1" /> Remove
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Save/Update Button */}
      <button
        type="button"
        onClick={documentExists ? onUpdate : onSubmit}
        className={`w-full uppercase py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:shadow-lg ${
          loading
            ? "bg-yellow-200"
            : documentExists
            ? "bg-violet-500 hover:bg-violet-400 text-white"
            : "bg-yellow-500 hover:bg-yellow-400 text-white"
        }`}
      >
        {documentExists ? "Update Changes" : "Save Changes"}
      </button>
    </div>
  );
}

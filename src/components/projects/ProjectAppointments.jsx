import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../firebase";
import { toast } from "react-toastify";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  collectionGroup,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Spinner from "../../components/Spinner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, getDay, setHours, setMinutes, parseISO } from "date-fns";

export default function ProjectAppointments() {
  const [pets, setPets] = useState([]); // State for storing pets
  const [noPets, setNoPets] = useState(true); // State to check if there are pets
  const [formData, setFormData] = useState({
    reason: "",
    pet: "",
    event_date: "",
    event_time: "",
    condition: "",
    additional: "",
    numberOfVisitors: "",
    comments: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const [projectId, setProjectId] = useState("");
  const [clientId, setClientId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [services, setServices] = useState([]);
  const [isAnimalShelter, setIsAnimalShelter] = useState(false);
  const [headerColor, setHeaderColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false); // Loading state for the spinner
  const [isHovered, setIsHovered] = useState(false);
  const [bookedTimes, setBookedTimes] = useState([]);

  const navigate = useNavigate();
  const auth = getAuth();

  const { slug } = useParams();

  const [customSchedules, setCustomSchedules] = useState({});

  const [blockedDays, setBlockedDays] = useState([]);
  // Convert blockedDays from strings to Date objects
  const blockedDates = blockedDays.map((date) => new Date(date));

  const [disableDaysOfWeek, setDisableDaysOfWeek] = useState([]);
  const [startDate, setStartDate] = useState(null);

  // Handle date change and update formData
  const handleDateChange = (date) => {
    setStartDate(date);
    setFormData((prevData) => ({
      ...prevData,
      event_date: date ? date.toISOString().split("T")[0] : "", // Save in YYYY-MM-DD format
    }));
  };

  // Fetch blocked days
  useEffect(() => {
    const fetchBlockedDays = async () => {
      if (projectId) {
        try {
          const docRef = doc(db, "appointments-section", projectId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setBlockedDays(data.blockedDays || []); // Set blockedDays or an empty array
            setDisableDaysOfWeek(data.disableDaysOfWeek || []);
          } else {
            console.log(
              "No document found in appointments-section for this projectId."
            );
          }
        } catch (error) {
          console.error("Error fetching blocked days:", error);
        }
      }
    };

    fetchBlockedDays();
  }, [projectId]);

  useEffect(() => {
    const fetchCustomSchedules = async () => {
      if (projectId) {
        try {
          const docRef = doc(db, "appointments-section", projectId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setCustomSchedules(data); // Save the fetched custom schedules
          } else {
            console.log("No custom schedules found.");
          }
        } catch (error) {
          console.error("Error fetching custom schedules: ", error);
        }
      }
    };

    fetchCustomSchedules();
  }, [projectId]);

  // Fetch projectId and project type (Animal Shelter or Veterinary)
  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        // Step 1: Query the `global-sections` collection using the slug
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);

        // Check if we found any documents
        if (!querySnapshot.empty) {
          // Get the first document from the query result
          const document = querySnapshot.docs[0]; // Renamed variable
          const projectId = document.id;

          const data = document.data(); // Get the data of the document
          setHeaderColor(data.headerColor); // Access the headerColor attribute
          setProjectId(projectId);

          // Step 2: Fetch project details from the `projects` collection using the `projectId`
          const projectRef = doc(db, "projects", projectId);
          const projectSnapshot = await getDoc(projectRef);

          // Check if the project document exists
          if (projectSnapshot.exists()) {
            const projectData = projectSnapshot.data();

            // Set the type-specific state if it's an "Animal Shelter Site"
            if (projectData.type === "Animal Shelter Site") {
              setIsAnimalShelter(true);
            }
          } else {
            console.log("No project found with the provided projectId.");
          }
        } else {
          console.log("No matching documents in global-sections.");
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProjectId();
  }, [slug]);

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Set to tomorrow
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  // Helper to disable specific weekdays
  const isDayAllowed = (date) => {
    const day = getDay(date); // Sunday = 0, Monday = 1, ..., Saturday = 6
    return !disableDaysOfWeek.includes(day);
  };

  // Helper to disable specific dates
  const isDateAllowed = (date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Format as "YYYY-MM-DD"
    return !blockedDays.includes(formattedDate);
  };

  // Combine both filters
  const filterDate = (date) => isDayAllowed(date) && isDateAllowed(date);

  // Fetch services based on projectId
  useEffect(() => {
    const fetchServices = async () => {
      if (projectId) {
        try {
          const q = query(
            collection(db, "services"),
            where("projectId", "==", projectId)
          );
          const querySnapshot = await getDocs(q);
          const servicesData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title,
          }));
          setServices(servicesData);
        } catch (error) {
          console.error("Error fetching services: ", error);
        }
      }
    };
    fetchServices();
  }, [projectId]);

  // Fetch clientId based on the logged-in user's email
  useEffect(() => {
    const fetchClientId = async (email) => {
      try {
        const q = query(collection(db, "clients"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const clientDoc = querySnapshot.docs[0];
          setClientId(clientDoc.id);
        } else {
          console.log("No client found with this email.");
        }
      } catch (error) {
        console.error("Error fetching client data: ", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchClientId(user.email);
      } else {
        console.log("No user logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  const darkenColor = (color, amount) => {
    let usePound = false;

    if (color[0] === "#") {
      color = color.slice(1);
      usePound = true;
    }

    let num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    let b = ((num >> 8) & 0x00ff) + amount;
    let g = (num & 0x0000ff) + amount;

    r = r > 255 ? 255 : r < 0 ? 0 : r;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    g = g > 255 ? 255 : g < 0 ? 0 : g;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
  };

  // Fetch pets based on clientId and projectId
  useEffect(() => {
    const fetchPets = async () => {
      if (clientId && projectId) {
        try {
          const q = query(
            collection(db, "pets"),
            where("clientId", "==", clientId),
            where("projectId", "==", projectId)
          );
          const querySnapshot = await getDocs(q);
          const petsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().petName,
          }));
          setPets(petsData);
          setNoPets(petsData.length === 0);
        } catch (error) {
          console.error("Error fetching pets: ", error);
        }
      }
    };
    fetchPets();
  }, [clientId, projectId]);

  // Fetch booked appointments
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "appointments"),
      (snapshot) => {
        try {
          const appointmentsArray = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.event_datetime && data.status !== "rejected") {
              // Convert Firestore Timestamp to JavaScript Date object
              const dateObj = data.event_datetime.toDate();
              appointmentsArray.push(dateObj);
            }
          });

          // Save the fetched dates to state
          setBookedTimes(appointmentsArray);
        } catch (error) {
          console.error("Error processing snapshot:", error);
        }
      },
      (error) => {
        console.error("Error fetching appointments:", error);
      }
    );

    // Clean up subscription on component unmount
    return () => unsubscribe();
  }, []);
  // Fetch available time slots
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    const generateTimeSlots = () => {
      const slots = [];
      const today = new Date(formData.event_date); // Get selected event date
      const dayOfWeek = today.getDay(); // Get the day of the week (0-6, Sunday-Saturday)

      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      const dayKey = days[dayOfWeek + 1]; // Get the day's name (e.g., "monday", "tuesday")
      const schedule = customSchedules.customSchedules[dayKey]; // Lookup the schedule using the day's name as a key
      console.log(customSchedules.customSchedules[dayKey]);
      if (!schedule) {
        // No schedule for the selected day
        setTimeSlots([]); // Clear time slots
        return;
      }

      const startHour = parseInt(schedule.start.split(":")[0]);
      const startMinute = parseInt(schedule.start.split(":")[1] || "0");
      const endHour = parseInt(schedule.end.split(":")[0]);
      const endMinute = parseInt(schedule.end.split(":")[1] || "0");

      // Generate time slots in 30-minute intervals
      let currentHour = startHour;
      let currentMinute = startMinute;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMinute < endMinute)
      ) {
        const timeSlot = convertTo12HourFormat(currentHour, currentMinute);
        const datetime = new Date(
          `${formData.event_date}T${currentHour
            .toString()
            .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}:00`
        );

        // Only add the time slot if it's not booked
        if (
          !bookedTimes.some(
            (booked) =>
              booked instanceof Date && booked.getTime() === datetime.getTime()
          )
        ) {
          slots.push(timeSlot);
        }

        // Increment by 30 minutes
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentMinute = 0;
          currentHour += 1;
        }
      }

      setTimeSlots(slots);
    };
    
    if(formData.event_date != "")
      generateTimeSlots();

  }, [formData.event_date, bookedTimes, customSchedules]);

  // Convert 24-hour time to 12-hour format with AM/PM
  const convertTo12HourFormat = (hour, minute) => {
    const period = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${adjustedHour}:${formattedMinute} ${period}`;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox changes for each checkbox separately
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!formData.reason) {
      return toast.error("Reason is required.");
    }
    if (!formData.event_date || !formData.event_time) {
      return toast.error("Date and time are required.");
    }
    if (isAnimalShelter && !formData.numberOfVisitors) {
      return toast.error("Number of visitors is required.");
    }
    if (isAnimalShelter && !formData.comments) {
      return toast.error("Comments/Questions are required.");
    }

    // Create the event datetime
    const event_datetime = new Date(
      `${formData.event_date} ${formData.event_time}`
    );

    const currentUser = auth.currentUser;
    const userUid = currentUser?.uid;

    if (!userUid) {
      toast.error("You must be logged in to book an appointment.");
      return;
    }

    setLoading(true); // Start the loading spinner

    // Prepare appointment data based on project type
    const appointmentData = isAnimalShelter
      ? {
          reason: formData.reason,
          event_datetime,
          projectId,
          clientId: userUid,
          numberOfVisitors: formData.numberOfVisitors,
          additional: formData.comments,
          createdAt: serverTimestamp(),
          status: "pending",
        }
      : {
          reason: formData.reason,
          pet: formData.pet || "No Pets",
          event_datetime,
          projectId,
          clientId: userUid,
          condition: formData.condition || "",
          additional: formData.additional || "",
          createdAt: serverTimestamp(),
          status: "pending",
        };

    try {
      // Step 1: Add the appointment to the flat "appointments" collection
      const appointmentsRef = collection(db, "appointments");
      await addDoc(appointmentsRef, appointmentData);

      toast.success("Appointment booked successfully!");
      navigate(`/sites/${slug}/dashboard`);

      // Step 2: Create a notification entry
      const notificationData = {
        message: `Your appointment bas been submitted for ${formData.event_date} at ${formData.event_time}. Status: 'Pending'`,
        read: false,
        timestamp: serverTimestamp(),
        type: "appointment",
      };

      // Step 3: Add the notification to the database
      const notificationsRef = collection(
        db,
        "notifications",
        projectId,
        userUid
      );
      await addDoc(notificationsRef, notificationData);
      navigate(`/sites/${slug}/dashboard`);
    } catch (error) {
      console.error("Error booking appointment: ", error);
      toast.error("Failed to book the appointment.");
    } finally {
      setLoading(false); // Stop the loading spinner
    }
  };

  return (
    <div className="bg-gray-100">
      <main className="container mx-auto px-4 py-24">
        <section className="p-6 rounded-lg shadow-md max-w-2xl mx-auto bg-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mt-6">Set Appointment</h2>
          </div>
          {loading && <Spinner />}

          {/* Display banner when no pets are registered */}
          {noPets && !isAnimalShelter && (
            <div className="bg-red-100 text-red-600 text-center py-4 px-6 rounded-md my-6">
              You have no pets registered. You cannot create an appointment.
            </div>
          )}
          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="reason" className="block text-left font-medium">
                Reason for Appointment
              </label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-lg"
                required
              >
                <option value="">Select a reason</option>

                {!isAnimalShelter &&
                  services.map((service) => (
                    <option key={service.id} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                {isAnimalShelter && (
                  <>
                    <option value="Visit Shelter">Visit Shelter</option>
                    <option value="Drop-off Donations">
                      Drop-off Donations
                    </option>
                    <option value="Volunteer Work">Volunteer Work</option>
                    <option value="For Adoption">For Adoption</option>
                  </>
                )}
              </select>
            </div>

            {!isAnimalShelter && (
              <div className="mb-4">
                <label htmlFor="pet" className="block text-left font-medium">
                  Select Pet
                </label>
                <select
                  id="pet"
                  name="pet"
                  value={formData.pet}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-2 border rounded-lg"
                >
                  <option value="">Select a pet</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.name}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="event_date"
                className="block text-left font-medium"
              >
                Appointment Date
              </label>
              {/* <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                min={getMinDate()} // Disable past dates and today
                className="w-full mt-2 p-2 border rounded-lg"
                required
              /> */}

              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                filterDate={filterDate} // Apply combined filters
                minDate={new Date()} // Disable past dates
                excludeDates={blockedDates}
                placeholderText="Select an appointment date"
                dateFormat="MMMM d, yyyy"
                className="w-full mt-2 p-2 border rounded-lg"
                wrapperClassName="w-full" // Ensures the wrapper spans full width
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="event_time"
                className="block text-left font-medium"
              >
                Appointment Time
              </label>
              <select
                id="event_time"
                name="event_time"
                value={formData.event_time}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-lg"
                required
              >
                <option value="">Select a time</option>
                {timeSlots.map((timeSlot, index) => (
                  <option key={index} value={timeSlot}>
                    {timeSlot}
                  </option>
                ))}
              </select>
            </div>

            {!isAnimalShelter && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="condition"
                    className="block text-left font-medium"
                  >
                    Current Condition
                  </label>
                  <textarea
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full mt-2 p-2 border rounded-lg"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="condition"
                    className="block text-left font-medium"
                  >
                    Additional Information
                  </label>
                  <textarea
                    id="additional"
                    name="additional"
                    value={formData.additional}
                    onChange={handleInputChange}
                    className="w-full mt-2 p-2 border rounded-lg"
                  ></textarea>
                </div>
              </>
            )}

            {isAnimalShelter && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="numberOfVisitors"
                    className="block text-left font-medium"
                  >
                    Number of Visitors
                  </label>
                  <input
                    type="number"
                    id="numberOfVisitors"
                    name="numberOfVisitors"
                    value={formData.numberOfVisitors}
                    onChange={handleInputChange}
                    className="w-full mt-2 p-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="comments"
                    className="block text-left font-medium"
                  >
                    Comments/Questions
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleInputChange}
                    className="w-full mt-2 p-2 border rounded-lg"
                    required
                  ></textarea>
                </div>
              </>
            )}

            {/* Terms and Conditions Checkbox */}
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                  required
                />
                <span className="ml-2">
                  I agree to the{" "}
                  <Link
                    to={`/sites/${slug}/terms-and-conditions`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-hover duration-200 ease-in-out transition"
                    style={{ color: headerColor }}
                  >
                    Terms and Conditions
                  </Link>
                </span>
              </label>
            </div>

            {/* Privacy Policy Checkbox */}
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  id="agreePrivacy"
                  name="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                  required
                />
                <span className="ml-2">
                  I agree to the{" "}
                  <Link
                    to={`/sites/${slug}/privacy-policy`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-hover duration-200 ease-in-out transition"
                    style={{ color: headerColor }}
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className={`w-full p-2 rounded-lg ${
                loading || (!isAnimalShelter && noPets)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "text-white"
              }`}
              style={{
                backgroundColor: !loading
                  ? isHovered
                    ? darkenColor(headerColor, -20) // Darker shade on hover
                    : headerColor
                  : "#cccccc",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={loading || (!isAnimalShelter && noPets)} // Combine both conditions
            >
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

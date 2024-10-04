import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase"; // Import Firebase auth
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
} from "firebase/firestore"; // Firestore functions
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase auth functions

export default function ProjectAppointments() {
  const [pets, setPets] = useState([]); // Replace with actual data fetching logic
  const [noPets, setNoPets] = useState(pets.length === 0);
  const [formData, setFormData] = useState({
    reason: "",
    pet: "",
    event_datetime: "",
    condition: "",
    additional: "",
    agree: false,
  });

  const [projectId, setProjectId] = useState(""); // To store projectId
  const [clientId, setClientId] = useState(""); // To store clientId
  const [userEmail, setUserEmail] = useState(""); // To store user's email


  const [services, setServices] = useState([]); // State to store services


  const navigate = useNavigate();
  const auth = getAuth();
  // Extract slug from URL
  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  var slug;

  if (parts.length > 1) {
    slug = parts[1].split("/")[0]; // Get only the first part after "/"
  }

  // Fetch the projectId from global-sections table using slug
  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        // Reference the 'global-sections' collection and query by slug
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setProjectId(docData.projectId);
        } else {
          console.log("No matching documents.");
        }
      } catch (error) {
        console.error("Error fetching header data: ", error);
      }
    };
    fetchProjectId();
  }, [slug]);

   // Fetch the services for the projectId
   useEffect(() => {
    const fetchServices = async () => {
      if (projectId) {
        try {
          const q = query(collection(db, "services"), where("projectId", "==", projectId));
          const querySnapshot = await getDocs(q);
          const servicesData = querySnapshot.docs.map(doc => ({
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

  // Fetch the clientId based on logged-in user's email
  useEffect(() => {
    const fetchClientId = async (email) => {
      try {
        const q = query(collection(db, "clients"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const clientDoc = querySnapshot.docs[0];
          setClientId(clientDoc.id); // Get the Firestore document ID as clientId
        } else {
          console.log("No client found with this email.");
        }
      } catch (error) {
        console.error("Error fetching client data: ", error);
      }
    };

    // Check if a user is logged in and get the email
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email); // Store the user's email
        fetchClientId(user.email); // Fetch clientId using the email
      } else {
        console.log("No user logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  const [timeSlots, setTimeSlots] = useState([]);

  // Convert 24-hour time to 12-hour format with AM/PM
  const convertTo12HourFormat = (hour, minute) => {
    const period = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12; // Convert 0 to 12 for midnight/noon
    const formattedMinute = minute.toString().padStart(2, "0");
    return `${adjustedHour}:${formattedMinute} ${period}`;
  };

  useEffect(() => {
    const slots = [];
    const startHour = 8;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(convertTo12HourFormat(hour, 0)); // Push xx:00 time
      slots.push(convertTo12HourFormat(hour, 30)); // Push xx:30 time
    }
    setTimeSlots(slots);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, agree: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!formData.reason) {
      return toast.error("Reason is required.");
    }
    if (!formData.event_date || !formData.event_time) {
      return toast.error("Date and time are required.");
    }
    if (!formData.condition) {
      return toast.error("Condition is required.");
    }
    if (!formData.additional) {
      return toast.error("Additional information is required.");
    }

    // Merge date and time
    const event_datetime = new Date(
      `${formData.event_date} ${formData.event_time}`
    );

    // Upload data to Firebase
    try {
      await addDoc(collection(db, "appointments"), {
        projectId: projectId,
        reason: formData.reason,
        pet: formData.pet || "No Pets", // Allow submitting even if no pets
        event_datetime: event_datetime,
        condition: formData.condition,
        additional: formData.additional,
        createdAt: serverTimestamp(),
        status: "pending",
        clientId: clientId, // Save the fetched clientId
      });
      toast.success("Appointment booked successfully!");
      navigate(`/sites/${slug}/dashboard`);
    } catch (error) {
      console.error("Error booking appointment: ", error);
      toast.error("Failed to book the appointment.");
    }
  };

  return (
    <div className="bg-gray-100">
      <main className="container mx-auto px-4 py-24">
        <section className="p-6 rounded-lg shadow-md max-w-2xl mx-auto bg-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mt-6">Set Appointment</h2>
          </div>
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
              >
                <option value="">-- Select Reason --</option>
                {services.length > 0 ? (
                  services.map(service => (
                    <option key={service.id} value={service.title}>
                      {service.title}
                    </option>
                  ))
                ) : (
                  <option value="">No services available</option>
                )}
              </select>
            </div>

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
                disabled={noPets}
              >
                <option value="">--No Pets Selected--</option>
                {!noPets && pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="event-datetime" className="block text-left font-medium">
                Select Appointment Date and Time
              </label>
              <input
                className="w-full mt-2 p-2 border rounded-lg"
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                required
              />
              <select
                className="w-full mt-2 p-2 border rounded-lg"
                name="event_time"
                value={formData.event_time}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select a Time Slot --</option>
                {timeSlots.map((slot, index) => (
                  <option key={index} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="condition" className="block text-left font-medium">
                Please share condition about your pet
              </label>
              <textarea
                id="condition"
                name="condition"
                rows="4"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-lg"
              ></textarea>
            </div>

            <div className="mb-4">
              <label htmlFor="additional" className="block text-left font-medium">
                Additional Information
              </label>
              <textarea
                id="additional"
                name="additional"
                rows="4"
                value={formData.additional}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-lg"
              ></textarea>
            </div>

            <div className="mb-4">
              <p>
                By completing and submitting this form you agree to the following{" "}
                <Link to={`/sites/${slug}/terms-and-conditions`} className="text-blue-500">
                  Terms & Conditions
                </Link>
              </p>
            </div>

            <div className="mb-4">
              <input
                type="checkbox"
                id="agree"
                name="agree"
                checked={formData.agree}
                onChange={handleCheckboxChange}
                required
              />
              <label htmlFor="agree">Yes, I agree</label>
            </div>

            <button
              type="submit"
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 w-full"
            >
              Submit Appointment
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

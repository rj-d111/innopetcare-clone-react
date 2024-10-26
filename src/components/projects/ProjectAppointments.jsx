import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
    agree: false,
  });

  const [projectId, setProjectId] = useState("");
  const [clientId, setClientId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [services, setServices] = useState([]);
  const [isAnimalShelter, setIsAnimalShelter] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth();

  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  let slug;
  if (parts.length > 1) {
    slug = parts[1].split("/")[0];
  }

  // Fetch projectId and project type (Animal Shelter or Veterinary)
  useEffect(() => {
    const fetchProjectId = async () => {
      try {
        const q = query(
          collection(db, "global-sections"),
          where("slug", "==", slug)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setProjectId(docData.projectId);

          const projectRef = doc(db, "projects", docData.projectId);
          const projectSnapshot = await getDoc(projectRef);
          if (projectSnapshot.exists()) {
            const projectData = projectSnapshot.data();
            if (projectData.type === "Animal Shelter Site") {
              setIsAnimalShelter(true);
            }
          }
        } else {
          console.log("No matching documents.");
        }
      } catch (error) {
        console.error("Error fetching header data: ", error);
      }
    };
    fetchProjectId();
  }, [slug]);

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

  // Fetch available time slots
  const [timeSlots, setTimeSlots] = useState([]);
  useEffect(() => {
    const slots = [];
    const startHour = 8;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(convertTo12HourFormat(hour, 0));
      slots.push(convertTo12HourFormat(hour, 30));
    }
    setTimeSlots(slots);
  }, []);

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

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, agree: e.target.checked });
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

    const event_datetime = new Date(
      `${formData.event_date} ${formData.event_time}`
    );

    // Prepare data for upload based on project type
    const appointmentData = {
      projectId: projectId,
      reason: formData.reason,
      pet: isAnimalShelter ? "No Pets" : formData.pet || "No Pets",
      event_datetime: event_datetime,
      condition: isAnimalShelter ? "" : formData.condition,
      additional: isAnimalShelter ? formData.comments : formData.additional,
      createdAt: serverTimestamp(),
      status: "pending",
      clientId: clientId,
    };

    try {
      if (isAnimalShelter) {
        appointmentData.numberOfVisitors = formData.numberOfVisitors;
        await addDoc(collection(db, "appointments-shelter"), appointmentData);
      } else {
        appointmentData.condition = formData.condition;
        await addDoc(collection(db, "appointments"), appointmentData);
      }

      const notificationData = {
        clientId: clientId,
        message: `Your appointment was successfully booked for ${formData.event_date} at ${formData.event_time}. Status: 'Pending'`,
        projectId: projectId,
        read: false,
        timestamp: serverTimestamp(),
        type: "appointment",
      };

      await addDoc(collection(db, "notifications"), notificationData);

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
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-lg"
                required
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

            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  id="agree"
                  name="agree"
                  checked={formData.agree}
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
                    className="text-blue-600 underline"
                  >
                    Terms and Conditions
                  </Link>{" "}
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded-lg"
            >
              Book Appointment
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

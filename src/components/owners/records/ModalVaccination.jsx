import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { db } from "../../../firebase";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

const ModalVaccination = ({ petId, isOpen, onClose }) => {
  const projectId = useParams().id;
  const [veterinarian, setVeterinarian] = useState("");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0], // default to today
    due: "",
    weight: "",
    against: "",
    manufacturer: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch veterinarian's name
  useEffect(() => {
    const fetchVeterinarian = async () => {
      try {
        // Fetch project to get the userId
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        const userId = projectDoc.data().userId;

        // Fetch user to get their name
        const userDoc = await getDoc(doc(db, "users", userId));
        setVeterinarian(userDoc.data().name);
      } catch (error) {
        console.error("Error fetching veterinarian info:", error);
      }
    };

    if (projectId) {
      fetchVeterinarian();
    }
  }, [projectId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form fields
    if (
      !formData.date ||
      !formData.due ||
      !formData.weight ||
      !formData.against ||
      !formData.manufacturer ||
      !veterinarian
    ) {
      alert("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save the record to the "records-vaccination" table in Firebase
      await addDoc(collection(db, "records-vaccination"), {
        petId,
        date: formData.date,
        due: formData.due,
        weight: formData.weight,
        against: formData.against,
        manufacturer: formData.manufacturer,
        veterinarian,
        projectId,
        createdAt: new Date(),
      });

      // Close the modal and reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        due: "",
        weight: "",
        against: "",
        manufacturer: "",
      });
      onClose();
      toast.success("Successfully added record");
    } catch (error) {
      toast.error("Error adding record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-bold mb-4">Add Vaccination Record</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Due</label>
            <input
              type="date"
              name="due"
              value={formData.due}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Against</label>
            <input
              type="text"
              name="against"
              value={formData.against}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Veterinarian</label>
            <input
              type="text"
              name="veterinarian"
              value={veterinarian}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalVaccination;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProjectAppointments() {
  const [pets, setPets] = useState([]); // Replace with actual data fetching logic
  const [noPets, setNoPets] = useState(pets.length === 0);
  const [formData, setFormData] = useState({
    reason: '',
    pet: '',
    event_datetime: '',
    condition: '',
    additional: '',
    agree: false,
  });

  const pathname = window.location.href;
  const parts = pathname.split("sites/");
  var slug;

 

  // Check if there's a part after "sites/"
  if (parts.length > 1) {
    slug = parts[1].split("/")[0]; // Get only the first part after "/"
   } 


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, agree: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
  };

  return (
    <div className="bg-gray-100">
      <main className="container mx-auto px-4 py-24">
        <section className="p-6 rounded-lg shadow-md max-w-2xl mx-auto bg-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mt-6">Set Appointment</h2>
          </div>
          {noPets && (
            <div className="bg-red-500 text-white text-center py-2 px-4 my-6 rounded">
              Please add a new pet to continue scheduling your appointment.
            </div>
          )}
          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="reason"
                className="block text-left font-medium"
              >
                Reason for Appointment
              </label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-lg"
              >
                <option>Vaccination</option>
                <option>Consultation</option>
                <option>Deworming</option>
                <option>Surgeries</option>
                <option>Confinement</option>
                <option>Grooming</option>
                <option>Pharmacy & Pet Supplies</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="pet"
                className="block text-left font-medium"
              >
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
                {!noPets ? (
                  pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))
                ) : (
                  <option>--No Pets Selected--</option>
                )}
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="event-datetime"
              >
                Event Date and Time
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="event-datetime"
                name="event_datetime"
                type="datetime-local"
                value={formData.event_datetime}
                onChange={handleInputChange}
              />
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
                By completing and submitting this form you agree to the following{' '}
                <Link to={`/sites/${slug}/terms-and-conditions`}className="text-blue-500">
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
            <div className="text-center">
              <button
                type="submit"
                className={`px-6 py-3 text-white rounded-lg shadow transition duration-300 ${
                  noPets ? 'cursor-not-allowed bg-gray-300' : 'hover:bg-red-600 bg-red-500'
                }`}
                disabled={noPets}
              >
                Book Now
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

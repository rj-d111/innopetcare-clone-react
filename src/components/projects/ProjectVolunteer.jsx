import React from 'react';
import VolunteerPhoto from '../../assets/webp/volunteer-shelter.webp';

export default function ProjectVolunteer() {
  return (
    <div className="bg-pink-50 py-10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-pink-600 mb-4">
          Become a volunteer and help us care for our rescued pets.
        </h2>
        <p className="text-gray-700 mb-6">
          Even if you can’t adopt, you can be a hero by volunteering your time. 
          We have opportunities for everyone, no experience necessary!
        </p>

        <div className="mb-6">
          <img 
            src={VolunteerPhoto} 
            alt="Volunteer at animal shelter" 
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <p className="text-gray-700 mb-8">
          Our animal shelter relies on caring volunteers like you to give rescued pets the love 
          and attention they need.
        </p>

        <button className="btn btn-primary px-6 py-3 text-white bg-pink-500 rounded-lg hover:bg-pink-600"
          onClick={() => {
            window.location.href = 'appointments';
          }}
        >
          Volunteer Now
        </button>
      </div>
    </div>
  );
}

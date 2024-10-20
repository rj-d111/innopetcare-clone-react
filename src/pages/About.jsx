import React from 'react';

export default function About() {
  return (
    <div className="py-16 bg-gray-100">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold text-yellow-900 mb-8">About Us</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold text-yellow-600 mb-4">Our Mission</h2>
          <p className="text-gray-700">
            At InnoPetCare, our mission is to empower veterinary clinics and animal shelters with innovative solutions that enhance pet care and streamline operations. We are dedicated to providing tools that enable organizations to focus on delivering exceptional service to pets and their owners.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold text-yellow-600 mb-4">Our Vision</h2>
          <p className="text-gray-700">
            We envision a future where every pet receives the highest standard of care, supported by well-equipped clinics and shelters that thrive in their communities. We aim to foster a world where technology and compassion come together to improve animal welfare.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold text-yellow-600 mb-4">Core Values</h2>
          <ul className="list-disc list-inside text-gray-700 text-left">
            <li><strong>Compassion:</strong> We believe in prioritizing the well-being of pets and the people who care for them.</li>
            <li><strong>Innovation:</strong> We are committed to developing cutting-edge solutions that address the evolving needs of veterinary practices and shelters.</li>
            <li><strong>Collaboration:</strong> We work closely with veterinary professionals and shelters to understand their challenges and create tailored tools that empower them.</li>
            <li><strong>Integrity:</strong> We operate with transparency and honesty, ensuring our clients can trust us to support their mission.</li>
          </ul>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8 mb-10">
          <h2 className="text-2xl font-semibold text-yellow-600 mb-4">Our Background</h2>
          <p className="text-gray-700">
            InnoPetCare was founded by a team of animal lovers and tech enthusiasts who recognized the challenges faced by veterinary clinics and animal shelters. With years of experience in both veterinary care and technology development, we set out to create a platform that bridges the gap between compassionate care and efficient management. Today, we are proud to support organizations across the country in their vital work, making a positive impact in the lives of pets and their communities.
          </p>
        </div>

        <div className="bg-yellow-600 text-white rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Join Us!</h2>
          <p className="text-gray-200 mb-4">
            Join us in our journey to elevate pet care and create a brighter future for all animals!
          </p>
          <button className="bg-white text-yellow-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-300">
            Get Involved
          </button>
        </div>
      </div>
    </div>
  );
}

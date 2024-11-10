import React from 'react';
import DonateImg1 from '../../assets/jpg/donate-1.jpg';
import DonateImg2 from '../../assets/jpg/donate-2.jpg';
import DonateImg3 from '../../assets/jpg/donate-3.jpg';
import DonateImg4 from '../../assets/jpg/donate-4.jpg';

export default function ProjectDonateDraft() {
  return (
    <div className="bg-pink-50 py-10">
      {/* Image Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <img src={DonateImg1} alt="Donate Image 1" className="rounded-lg shadow-lg" />
        <img src={DonateImg2} alt="Donate Image 2" className="rounded-lg shadow-lg" />
        <img src={DonateImg3} alt="Donate Image 3" className="rounded-lg shadow-lg" />
        <img src={DonateImg4} alt="Donate Image 4" className="rounded-lg shadow-lg" />
      </div>

      {/* Main Donation Message */}
      <div className="text-center bg-white py-10 px-4 rounded-lg shadow-lg mx-auto max-w-3xl mb-10">
        <h2 className="text-4xl font-bold text-pink-600 mb-4">Make a Real Difference!</h2>
        <p className="text-gray-700">
          Every contribution, big or small, helps us care for the animals at our shelter.
        </p>
      </div>

      {/* Donation Options */}
      <div className="bg-blue-50 py-10">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800">
            Help us care for the amazing animals at our shelter by donating.
          </h3>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Donate Funds Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h4 className="text-xl font-semibold text-pink-600 mb-4">Donate Funds</h4>
            <p className="text-gray-700 mb-6">
              Your financial support allows us to purchase foods, medicine, and other essentials
              for our furry friends in this shelter.
            </p>
            <p className="text-gray-700 mb-4">
              You can donate funds directly to our landbank account:
            </p>
            <div className="font-bold text-green-600">
              LANDBANK <br />
              Wilma Evangelista <br />
              SA 3127 016 797
            </div>
          </div>

          {/* Donate Pet Supplies Card */}
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h4 className="text-xl font-semibold text-pink-600 mb-4">Donate Pet Supplies</h4>
            <p className="text-gray-700 mb-6">
              We’re gratefully accepting donations of pet supplies such as pet food, leashes, food bowls, 
              and even building materials like tarpaulins or ropes for shelter repairs.
            </p>
            <button
  className="btn btn-primary bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
  onClick={() => {
    window.location.href = 'appointments';
  }}
>
  Set Appointment
</button>
          </div>
        </div>
      </div>
    </div>
  );
}

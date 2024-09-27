import React from 'react';

export default function ProjectHelp() {
  return (
    <div className="container mx-auto py-16">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">Peace of Mind From Home</h2>
      <p className="text-center text-gray-700 mb-12">
        Get reassurance from Fort Deo via free chat via Messenger or with a scheduled video call.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <i className="fas fa-user-md text-6xl text-blue-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Experienced professionals</h3>
          <p className="text-gray-600">
            Our vets and vet techs are licensed, experienced, and passionate about helping pets and pet parents.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <i className="fas fa-heart text-6xl text-blue-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalized advice</h3>
          <p className="text-gray-600">
            We take time to understand your pet and create a personalized consult report.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <i className="fas fa-heart text-6xl text-blue-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Convenient online care</h3>
          <p className="text-gray-600">
            Get guidance from online vets and vet techs without stressful travel.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <i className="fas fa-shopping-cart text-6xl text-blue-500 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">One stop for pet health</h3>
          <p className="text-gray-600">
            Get curated suggestions for pet items and shop at great prices.
          </p>
        </div>
      </div>
    </div>
  );
}

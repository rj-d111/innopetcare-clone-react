import React from "react";
import { FaCalendarAlt, FaUserCircle } from "react-icons/fa";


export default function ProjectDashboard({
  user = {},
  successMessage = "",
  nextAppointment = null,
}) {
  return (
    <div className="bg-gray-200">
      <div className="lg:px-10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-blue-600 py-6">Dashboard</h1>
          {/* Success Message */}
          {successMessage && (
            <div
              className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50"
              role="alert"
            >
              <span className="font-medium">{successMessage}</span>
            </div>
          )}
          <div className="container mx-auto p-6">
            {/* Welcome Section */}
            <div className="bg-white p-10 rounded-lg shadow-md mb-6">
              <h2 className="text-4xl font-bold">Welcome {user.name || ""}!</h2>
              <p className="text-gray-700 pt-4 text-lg">
                We're happy to see you here at San Pedro Animal Shelter
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Connected Care Corner */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold">
                  Connected Care Corner
                </h2>
                <p className="text-gray-700">Latest Update:</p>
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center">
                  <FaUserCircle size={44} className="mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Precious Confinement - Current Status
                      </h3>
                      <p className="text-sm text-gray-500">
                        by Fort Deo Animal Clinic - Staff
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Hi Sir. I wanted to give you an update on Precious's
                    condition. Unfortunately, he's still not eating as expected.
                    We're closely monitoring his condition and providing
                    supportive care to help him recover from parvovirus. We'll
                    keep you updated on any changes. Please don't hesitate to
                    contact us if you have any concerns.
                  </p>
                  <div className="mt-4">
                    <img
                      src="/images/precious.jpg" // Use a proper path or dynamic image loading
                      alt="Precious the cat"
                      className="rounded-lg w-full object-cover"
                    />
                  </div>
                  <a
                    href="#"
                    className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Go to Pet Owner Forum
                  </a>
                </div>
              </div>
              {/* Upcoming Appointment Details */}
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold">
                  Upcoming Appointment Details
                </h2>
                <div className="flex items-center mt-4">
                  <FaCalendarAlt className="text-6xl" />
                  <div className="ml-4">
                    {nextAppointment ? (
                      <>
                        <p className="text-xl mb-2">
                          Your next appointment is for:
                        </p>
                        <p className="font-bold text-pink-500">
                          {new Date(
                            nextAppointment.event_datetime
                          ).toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                          })}
                        </p>
                        <p>Status: {nextAppointment.status}</p>
                      </>
                    ) : (
                      <p className="text-xl mb-2">No upcoming appointments</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

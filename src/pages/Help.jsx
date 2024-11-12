import React from "react";
import helpMenuPic from "../assets/png/help-menu.png";

export default function Help() {
  return (
    <div className="p-8 bg-gray-50 rounded-lg shadow-xl max-w-5xl mx-auto my-12">
      <h1 className="text-4xl font-bold text-center text-teal-600 mb-10">
        Help Information
      </h1>

      {/* Getting Started Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">
          Getting Started
        </h2>
        <p className="text-gray-700 mb-4">
          <strong>User Registration:</strong> To create your account, click the
          "For Veterinary/Animal Shelter admin button" on the homepage. Fill in
          the required details, including your email address, password, and
          organization type (veterinary clinic or animal shelter).
        </p>
        <p className="text-gray-700">
          <strong>Initial Setup:</strong> After registration, complete your
          profile by adding your clinic/shelter information, including name,
          address, and contact details.
        </p>
      </div>

      {/* Inserted Image */}
      <div className="flex justify-center mb-12">
        <img
          src={helpMenuPic}
          alt="Help Menu"
          className="w-full max-w-md rounded-lg shadow-lg"
        />
      </div>

      {/* Managing Your Profile Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">
          Managing Your Profile
        </h2>
        <p className="text-gray-700 mb-4">
          <strong>Updating Information:</strong> Go to the User Profile section
          to update your personal information, contact details, and profile
          picture.
        </p>
        <p className="text-gray-700">
          <strong>Changing Password:</strong> Use the "Change Password" option
          in your profile settings to secure your account.
        </p>
      </div>

      {/* Notification Settings Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">
          Using Notification Settings
        </h2>
        <p className="text-gray-700">
          <strong>Setting Reminder Notifications:</strong> Enable reminders for
          updates from InnoPetCare!
        </p>
      </div>

      {/* Data Privacy Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">
          Data Privacy and Security
        </h2>
        <p className="text-gray-700">
          <strong>Data Management:</strong> Ensure compliance by reviewing the
          Data Privacy section where you can manage client consent and data
          retention settings.
        </p>
      </div>

      {/* Contacting Support Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-teal-700 mb-4">
          Contacting Support
        </h2>
        <p className="text-gray-700">
          <strong>Support Channels:</strong> Reach out to our support team via
          email at{" "}
          <a
            href="mailto:support@innopetcare.com"
            className="text-teal-600 hover:underline"
          >
            support@innopetcare.com
          </a>{" "}
          or call us at 887-2651.
        </p>
      </div>

      {/* FAQs Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-teal-700 mb-6">FAQs</h2>
        {[
          {
            question: "How do I create an account?",
            answer:
              "Click 'For Veterinary/Animal Shelter admin button' on the homepage, enter your email, choose a password, and select your organization type.",
          },
          {
            question: "What should I do if I forget my password?",
            answer:
              "Click the 'Forgot Password?' link on the login page, enter your email, and follow the instructions sent to your inbox.",
          },
          {
            question: "How can I customize my notifications?",
            answer:
              "Go to your Settings, select 'Setting reminder notification,' and enable it.",
          },
          {
            question: "How do I add a new pet for adoption?",
            answer:
              "Navigate to the 'Adoptable Pets' section, click 'Add New Pet,' and fill out the required details.",
          },
          {
            question: "What if I encounter technical issues?",
            answer:
              "First, check our troubleshooting guide. If the issue persists, contact our support team for help.",
          },
          {
            question: "How do I provide feedback about the platform?",
            answer:
              "We welcome your feedback! Use the feedback form available in the Help section or contact our support team directly.",
          },
        ].map((faq, index) => (
          <div key={index} className="mb-6">
            <p className="font-medium text-lg text-teal-800">{faq.question}</p>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

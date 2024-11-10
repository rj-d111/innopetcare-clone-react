import React from "react";

export default function ProjectHelp() {
  return (
    <div className="p-6 bg-white max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-bold text-center mb-6">Help Information</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
        <p className="text-gray-700">
          <strong>User Registration:</strong> To create your account, click
          "For Veterinary/Animal Shelter admin button" on the homepage. Fill in
          the required details, including your email address, password, and
          organization type (veterinary clinic or animal shelter).
        </p>
        <p className="text-gray-700 mt-2">
          <strong>Initial Setup:</strong> After registration, complete your
          profile by adding your clinic/shelter information, including name,
          address, and contact details.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Managing Your Profile</h2>
        <p className="text-gray-700">
          <strong>Updating Information:</strong> Go to the User Profile section
          to update your personal information, contact details, and profile
          picture.
        </p>
        <p className="text-gray-700 mt-2">
          <strong>Changing Password:</strong> Use the "Change Password" option
          in your profile settings to secure your account.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Using Notification Settings</h2>
        <p className="text-gray-700">
          <strong>Setting Reminder Notifications:</strong> Enable reminders for
          updates from InnoPetCare!
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Data Privacy and Security</h2>
        <p className="text-gray-700">
          <strong>Data Management:</strong> Ensure compliance by reviewing the
          Data Privacy section where you can manage client consent and data
          retention settings.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Contacting Support</h2>
        <p className="text-gray-700">
          <strong>Support Channels:</strong> Reach out to our support team via
          email at <a href="mailto:innopetcare@gmail.com" className="text-blue-500">innopetcare@gmail.com</a> or call us at 887-2651.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">FAQs</h2>
        <div className="mb-4">
          <p className="font-medium">How do I create an account?</p>
          <p className="text-gray-700">
            Click "For Veterinary/Animal Shelter admin button" on the homepage,
            enter your email, choose a password, and select your organization
            type.
          </p>
        </div>
        <div className="mb-4">
          <p className="font-medium">What should I do if I forget my password?</p>
          <p className="text-gray-700">
            Click the "Forgot Password?" link on the login page, enter your
            email, and follow the instructions sent to your inbox.
          </p>
        </div>
        <div className="mb-4">
          <p className="font-medium">How can I customize my notifications?</p>
          <p className="text-gray-700">
            Go to your Settings, select Setting reminder notification, and
            enable it.
          </p>
        </div>
        <div className="mb-4">
          <p className="font-medium">How do I add a new pet for adoption?</p>
          <p className="text-gray-700">
            Navigate to the “Adoptable Pets” section, click “Add New Pet,” and
            fill out the required details.
          </p>
        </div>
        <div className="mb-4">
          <p className="font-medium">What if I encounter technical issues?</p>
          <p className="text-gray-700">
            First, check our troubleshooting guide. If the issue persists,
            contact our support team for help.
          </p>
        </div>
        <div className="mb-4">
          <p className="font-medium">How do I provide feedback about the platform?</p>
          <p className="text-gray-700">
            We welcome your feedback! Use the feedback form available in the
            Help section or contact our support team directly.
          </p>
        </div>
      </div>
    </div>
  );
}

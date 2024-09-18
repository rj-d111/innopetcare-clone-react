import React from "react";

export default function Login() {
  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center my-10">
        {/* Left side with laptop and phone image */}
        <div className="hidden md:block md:w-3/4 lg:w-1/2">
          <div className="p-10">
            <img
              src="images/platform.png"
              alt="Laptop and phone with InnoPetCare"
              className="max-w-full h-auto"
            />
          </div>
        </div>

        {/* Right side login form */}
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/3 w-full">
          <div className="text-center mb-6">
            <img
              src="/images/innopetcare-black.png"
              alt="InnoPetCare Logo"
              className="mx-auto mb-4"
            />
            <p className="text-gray-600 text-sm">
              InnoPetCare is a content management system (CMS) designed
              specifically for veterinary clinics and animal shelters to manage
              their online presence.
            </p>
          </div>

          <h2 className="font-bold text-yellow-900">
            Welcome! Login to your account.
          </h2>
          <p className="text-gray-600 text-sm mb-6">Let's work together to care for our furry friends.</p>
          <form action="LoginController" method="POST">
            <div className="mb-5">
              <label htmlFor="email" className="block text-gray-500 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="password" className="block text-gray-500 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold"
            >
              LOG IN
            </button>
          </form>

          <div className="text-center mt-6">
            <a
              href="#"
              className="text-sm text-yellow-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <a
                href="register"
                className="text-yellow-600 font-semibold hover:underline"
              >
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

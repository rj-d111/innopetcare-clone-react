import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center md:h-[calc(100vh-64px)] bg-gray-100 px-6">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-error">404</h1>
        <h2 className="text-3xl md:text-5xl font-bold mt-4 text-gray-800">
          Page Not Found
        </h2>
        <p className="text-gray-600 mt-4">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary mt-6">
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

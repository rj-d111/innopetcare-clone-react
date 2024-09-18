import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

export default function Header() {
  return (
      <header className="flex justify-between items-center p-4 bg-yellow-900">
        <img src="/images/innopetcare-white.png" alt="Innopetcare logo" className="h-8 cursor-pointer" />
        <div>
          <Link to="/login" className="text-white pr-4 cursor-pointer">Login</Link>
          <Link to="/options" className="bg-white px-4 py-2 rounded cursor-pointer">Start Creating</Link>
        </div>
      </header>
  );
}
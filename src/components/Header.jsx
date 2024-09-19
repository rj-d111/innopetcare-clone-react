import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

export default function Header() {
  return (
      <header className="flex justify-between items-center p-4 bg-yellow-900">
        <a href="/"><img src="/images/innopetcare-white.png" alt="Innopetcare logo" className="h-8 cursor-pointer" /></a>
        <div className='hidden md:block'>
          <Link to="/content-listing-page" className="text-white pr-4 cursor-pointer">Explore Clinics & Shelters</Link>
          <Link to="/options" className="text-white pr-4 cursor-pointer">Login</Link>
          <Link to="/login" className="bg-white px-4 py-2 rounded cursor-pointer">Get Started</Link>
        </div>
      </header>
  );
}
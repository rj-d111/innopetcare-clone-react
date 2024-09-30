import React from 'react';
import { Link, useParams } from 'react-router-dom';

const Sidebar = ({ projectType }) => {
  const { id } = useParams(); // useParams must be inside the component

  return (
    <aside className="w-1/4 h-screen bg-blue-800 text-white p-4">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <ul>
        <li>
          <Link to={`/${id}/dashboard`} className="block py-2 px-4 rounded hover:bg-blue-700">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to={`/${id}/schedule`} className="block py-2 px-4 rounded hover:bg-blue-700">
            Schedule
          </Link>
        </li>
        {projectType === 'Veterinary Site' ? (
          <>
            <li>
              <Link to={`/${id}/pet-records`} className="block py-2 px-4 rounded hover:bg-blue-700">
                Pet Health Records
              </Link>
            </li>
            <li>
              <Link to={`/${id}/pet-owners`} className="block py-2 px-4 rounded hover:bg-blue-700">
                Pet Owners
              </Link>
            </li>
            <li>
              <Link to={`/${id}/pending`} className="block py-2 px-4 rounded hover:bg-blue-700">
                Pending Requests
              </Link>
            </li>
            <li>
              <Link to={`/${id}/messages`} className="block py-2 px-4 rounded hover:bg-blue-700">
                Connected Care Center
              </Link>
            </li>
            <li>
              <Link to={`/${id}/adoptions`} className="block py-2 px-4 rounded hover:bg-blue-700">
                Pet Adoption
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to={`/${id}/pets`} className="block py-2 px-4 rounded hover:bg-blue-700">
                Rescue Pet Profiles
              </Link>
            </li>
            <li>
              <Link to={`/${id}/users`} className="block py-2 px-4 rounded hover:bg-blue-700">
                Users
              </Link>
            </li>
            <li>
              <Link to={`/${id}/adopt-tracker`} className="block py-2 px-4 rounded hover:bg-blue-700">
                Adopt Tracker
              </Link>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;

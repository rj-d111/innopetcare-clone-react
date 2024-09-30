import React from 'react';
import { FaTimes, FaClock } from 'react-icons/fa';

export default function ProjectNotifications() {
  const notifications = [
    {
      id: 1,
      type: 'New User',
      title: 'New Registration: Finibus Bonorum et Malorum',
      message: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      user: 'Allen Deu',
      time: '24 Nov 2018 at 9:30 AM',
      labelClass: 'bg-green-500',
    },
    {
      id: 2,
      type: 'Message',
      title: 'Darren Smith sent new message',
      message: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      user: 'Darren',
      time: '24 Nov 2018 at 9:30 AM',
      labelClass: 'bg-yellow-500',
    },
    {
      id: 3,
      type: 'Comment',
      title: 'Arin Ganshiram Commented on post',
      message: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      user: 'Arin Ganshiram',
      time: '24 Nov 2018 at 9:30 AM',
      labelClass: 'bg-purple-500',
    },
    {
      id: 4,
      type: 'Connect',
      title: 'Juliet Den Connect Allen Depk',
      message: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      user: 'Juliet Den',
      time: '24 Nov 2018 at 9:30 AM',
      labelClass: 'bg-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start border-b border-gray-200 py-4"
          >
            {/* Close Icon */}
            <div className="mr-4 mt-2">
              <FaTimes className="text-gray-400 hover:text-red-500 cursor-pointer" />
            </div>

            {/* Notification Content */}
            <div className="w-full">
              <div className="flex justify-between">
                {/* Notification Type */}
                <span
                  className={`text-white text-xs font-bold px-2 py-1 rounded ${notification.labelClass}`}
                >
                  {notification.type}
                </span>

                {/* Notification Time */}
                <div className="flex items-center text-gray-400 text-sm">
                  <FaClock className="mr-2" />
                  {notification.time}
                </div>
              </div>

              {/* Notification Title */}
              <h2 className="font-semibold text-gray-700 mt-2">
                {notification.title}
              </h2>

              {/* Notification Message */}
              <p className="text-gray-600 text-sm mt-1">
                {notification.message}
              </p>

              {/* User */}
              <p className="text-red-500 font-bold text-sm mt-2">
                {notification.user}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

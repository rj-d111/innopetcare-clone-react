import React from 'react';
import { FaComments, FaEye } from 'react-icons/fa';

export default function ProjectAdoption() {
  const threads = [
    {
      id: 1,
      title: 'UK Dog Rescue Directory **CURRENTLY UNDER CONSTRUCTION**',
      author: 'simplysardonic',
      date: 'Oct 31, 2017',
      replies: 27,
      views: '14K',
      pinned: true,
      iconClass: 'bg-green-500',
      lastReplyDate: 'Jan 8, 2018',
    },
    {
      id: 2,
      title: 'Unnecessary bumping up of threads',
      author: 'tashi',
      date: 'Nov 13, 2012',
      replies: 11,
      views: '13K',
      pinned: true,
      iconClass: 'bg-yellow-500',
      lastReplyDate: 'Sep 19, 2016',
    },
    {
      id: 3,
      title: 'It would be helpful',
      author: 'newfiesmum',
      date: 'Dec 31, 2013',
      replies: 0,
      views: '9K',
      pinned: true,
      iconClass: 'bg-blue-500',
      lastReplyDate: 'Dec 31, 2013',
    },
    {
      id: 4,
      title: 'Why so hard to rehome a dog from the RSPCA?',
      author: 'zidangus',
      date: 'Feb 21, 2021',
      replies: 36,
      views: '8K',
      pinned: false,
      iconClass: 'bg-green-500',
      lastReplyDate: 'Sep 10, 2024',
    },
    {
      id: 5,
      title: 'Strays in Bulgaria',
      author: 'Gofarmer',
      date: 'Jan 22, 2011',
      replies: 3,
      views: '875',
      pinned: false,
      iconClass: 'bg-yellow-500',
      lastReplyDate: 'May 25, 2024',
    },
    {
      id: 6,
      title: 'Frenchie/mix looking for forever home',
      author: 'H Bartlett-Scott',
      date: 'May 2, 2024',
      replies: 8,
      views: '719',
      pinned: false,
      iconClass: 'bg-blue-500',
      lastReplyDate: 'May 4, 2024',
    },
    {
      id: 7,
      title: '3 year old akita bitch needing rehoming after owner is taken terminal ill,',
      author: 'lakesidelass',
      date: 'Apr 27, 2024',
      replies: 3,
      views: '469',
      pinned: false,
      iconClass: 'bg-red-500',
      lastReplyDate: 'Apr 30, 2024',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page Heading */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dog Rescue and Adoption</h1>
      
      {/* Filters and Create Thread Button */}
      <div className="flex justify-between items-center mb-4">
        <button className="bg-gray-300 text-gray-700 py-1 px-4 rounded">Filters</button>
        <div>
          <button className="bg-green-600 text-white py-1 px-4 rounded mr-2">Follow Forum</button>
          <button className="bg-green-600 text-white py-1 px-4 rounded">Create Thread</button>
        </div>
      </div>

      <div className="flex gap-4">
      {/* Thread List */}
          <div className="w-3/4 bg-white shadow-md rounded-lg">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-2 px-4">Thread</th>
                  <th className="py-2 px-4">Replies</th>
                  <th className="py-2 px-4">Views</th>
                  <th className="py-2 px-4">Last Post</th>
                </tr>
              </thead>
              <tbody>
                {threads.map((thread) => (
                  <tr key={thread.id} className="border-b">
                    <td className="py-4 px-4 flex items-center">
                      {/* Icon */}
                      <span className={`inline-block w-4 h-4 rounded-full mr-2 ${thread.iconClass}`} />
                      <div>
                        <h3 className={`font-semibold ${thread.pinned ? 'text-green-600' : 'text-gray-800'}`}>
                          {thread.title}
                        </h3>
                        <p className="text-gray-500 text-sm">By {thread.author} on {thread.date}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                          <FaComments className="mr-2 text-gray-400" />
                          {thread.replies}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                          <FaEye className="mr-2 text-gray-400" />
                          {thread.views}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {thread.lastReplyDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>



          {/* Right Sidebar */}
          <div className="w-1/4">
            <div className="bg-white p-4 shadow-lg rounded-lg">
              <h2 className="font-semibold text-gray-800 mb-4">Dog Rescue and Adoption</h2>
              <p className="text-gray-600 text-sm">
                The Dog Rescue and Adoption section is the place for both rescue centers and private individuals to advertise their dogs which are in need of rehoming.
                If you are looking to adopt a dog or chat about dog rescue issues in general, you can also post here.
              </p>
              <button className="bg-green-600 text-white py-2 px-4 mt-4 rounded w-full">Join Community</button>
            </div>
            {/* Forum Staff */}
            <div className="bg-white p-4 shadow-lg rounded-lg mt-6">
              <h2 className="font-semibold text-gray-800 mb-4">Forum Staff</h2>
              <ul className="text-sm text-gray-600">
                <li className="mb-2">
                  <span className="font-semibold">lymorelynn</span> - Administrator
                </li>
                <li className="mb-2">
                  <span className="font-semibold">westie-ma</span> - Super Moderator
                </li>
              </ul>
            </div>
          </div>
      </div>
    </div>
  );
}

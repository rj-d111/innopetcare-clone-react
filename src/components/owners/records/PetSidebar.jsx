import { FaPlus } from 'react-icons/fa';

const PetSidebar = () => {
  return (
    <div className="w-1/4 bg-gray-100 p-4">
      <h2 className="text-lg font-bold mb-4">Pet Name List</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-full"
        />
      </div>
      <div className="flex gap-2 mb-4">
        <button className="btn btn-primary">All</button>
        <button className="btn btn-outline">Dog</button>
        <button className="btn btn-outline">Cat</button>
      </div>
      <button className="btn btn-circle btn-success">
        <FaPlus />
      </button>
      <ul className="list-none mt-4 overflow-auto h-96">
        {/* Map over pet names */}
        <li className="mb-2">
          <a href="#" className="block p-2 bg-blue-100 rounded">
            Cooper | 0034
          </a>
        </li>
        {/* Add more list items */}
      </ul>
    </div>
  );
};

export default PetSidebar;

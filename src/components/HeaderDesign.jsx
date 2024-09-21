import React from "react";
import innoPetCareSmallLogo from "../assets/png/InnoPetCareSmall.png";
import { IoDesktop, IoPhonePortrait } from "react-icons/io5";
import { MdModeEdit, MdPublish } from "react-icons/md";

const HeaderDesign = ({ isWebVersion, setWebVersion }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-yellow-500 shadow-sm sticky top-0 z-40">
      <img src={innoPetCareSmallLogo} alt="Logo" className="h-12" />
      <h1 className="text-xl font-bold">
        San Pedro Animal Shelter <MdModeEdit />
      </h1>
      <div className="flex space-x-4">
        <IoDesktop
          onClick={() => setWebVersion(true)}
          className={`cursor-pointer ${
            isWebVersion ? "text-black" : "text-gray-400"
          }`}
          size={24}
        />
        <IoPhonePortrait
          onClick={() => setWebVersion(false)}
          className={`cursor-pointer ${
            !isWebVersion ? "text-black" : "text-gray-400"
          }`}
          size={24}
        />
        <button
          type="submit"
          className="bg-white hover:bg-yellow-100 text-yellow-800 px-3 py-3 rounded-lg font-semibold transition duration-200 ease-in-out active:bg-yellow-200 shadow-md hover:shadow-lg active:shadow-lg"
        >
          <MdPublish className="text-lg" /> Publish Website{" "}
        </button>
      </div>
    </header>
  );
};

export default HeaderDesign;

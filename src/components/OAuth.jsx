import React from "react";
import { FcGoogle } from "react-icons/fc";

export default function OAuth() {
  return (
    <button className="flex items-center justify-center w-full bg-red-700 text-white uppercase text-sm font-medium hover:bg-red-800 active:bg-red-900 py-3 rounded-lg transition duration-200 ease-in-out shadow-md hover:shadow-lg active:shadow-lg">
      <FcGoogle className="text-2xl bg-white rounded-full mr-2"/>
      Continue with Google
    </button>
  );
}

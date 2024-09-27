import React from 'react'
import { MdOutlineDomainVerification } from "react-icons/md";

export default function ForApproval() {
  return (
    <>
          <div className=" flex items-center justify-center my-10 mx-3 text-center">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 lg:w-1/2 w-full">
        <div className="flex justify-center">
          <div className="bg-yellow-300 rounded-full p-5 flex items-center justify-center">
            <MdOutlineDomainVerification className="text-6xl text-yellow-900" />
          </div>
        </div>
        <h1 className="font-bold text-yellow-900 text-3xl mb-4">
            Waiting For Approval
        </h1>
        <p className="text-gray-600">For Approval you will need to visit our vet clinic or call us</p>
        <p className="font-bold">09XXXXXXXXX</p>
        <p className="text-gray-600 my-4">
          If your account has not been registered, it will automatically be deleted after 7 days.
        </p>
      </div>
    </div>
    </>
  )
}

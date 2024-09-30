import PetSidebar from "./records/PetSidebar";
import PetInformation from "./records/PetInformation";
import OwnerInformation from "./records/OwnerInformation";
import PetRecords from "./records/PetRecords";
const OwnerPetHealthRecords = () => {
  return (
    <div className="flex">
      <PetSidebar />
      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-bold text-red-600">Pet Health Records</h1>
        <div className="mt-4">
          <PetInformation />
          <OwnerInformation />
          <PetRecords />
        </div>
      </div>
    </div>
  );
};

export default OwnerPetHealthRecords;

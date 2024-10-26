import { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom'; // Import Outlet for route rendering
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from "../firebase";
import OwnerSidebar from '../components/owners/OwnerSidebar';
import Spinner from '../components/Spinner';

export default function OwnerHome() {
  const { id } = useParams();
  const [projectType, setProjectType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', id); 
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const projectData = docSnap.data();
          setProjectType(projectData.type);
        } else {
          console.log('No such project!');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [id]);

  if (!projectType) return <Spinner />;

  return (
    <div className="flex">
      <OwnerSidebar projectType={projectType} />
      <div className="flex-grow">
        {/* Outlet will render the matched route component */}
        <Outlet /> 
      </div>
    </div>
  );
}

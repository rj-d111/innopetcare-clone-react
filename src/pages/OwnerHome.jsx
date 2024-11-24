import { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom'; // Import Outlet for route rendering
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from "../firebase";
import OwnerSidebar from '../components/owners/OwnerSidebar';
import Spinner from '../components/Spinner';

export default function OwnerHome() {
  const { id } = useParams();
  const [projectType, setProjectType] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { globalSections } = location.state || {}; // Extract globalSections from state
  
  // Debugging: Check if globalSections is received
  console.log("Global Sections:", globalSections);



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
    <div className="flex h-[calc(100vh-64px)] print:h-auto">
      <OwnerSidebar projectType={projectType} globalSections={globalSections} />
      <div className="flex-grow overflow-auto print:overflow-visible">
        {/* Outlet will render the matched route component */}
        <Outlet /> 
      </div>
    </div>
  );
}

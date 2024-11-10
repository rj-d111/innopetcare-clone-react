import React from 'react';
import { useParams, Outlet } from 'react-router-dom';
import useSlugExists from '../components/hooks/useSlugExists';
import NotFound from '../pages/NotFound';
import Spinner from './Spinner';

const ProjectWrapper = () => {
  const { slug } = useParams();
  const exists = useSlugExists(slug);

  // Show loading spinner or message while checking
  if (exists === null) return <Spinner />;

  // Render nested routes if slug exists, otherwise show NotFound
  return exists ? <Outlet /> : <NotFound />;
};

export default ProjectWrapper;

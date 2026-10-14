import React from 'react';
import { Navigate } from 'react-router-dom';

const DeletedUsers = () => {
  return <Navigate to="/admin/users?status=deleted" replace />;
};

export default DeletedUsers;

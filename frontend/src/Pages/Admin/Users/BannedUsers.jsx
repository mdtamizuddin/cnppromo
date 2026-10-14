import React from 'react';
import { Navigate } from 'react-router-dom';

const BannedUsers = () => {
  return <Navigate to="/admin/users?status=banned" replace />;
};

export default BannedUsers;

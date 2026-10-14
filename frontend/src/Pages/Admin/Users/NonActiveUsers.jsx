import React from 'react';
import { Navigate } from 'react-router-dom';

const NonActiveUsers = () => {
  return <Navigate to="/admin/users?status=pending" replace />;
};

export default NonActiveUsers;

import React from 'react';
import PremiumUsersTable from './components/PremiumUsersTable';

const Users = () => {
  return (
    <div className="container mx-auto">
      <PremiumUsersTable 
        status="active" 
        title="Active Users" 
        subtitle="Manage all active users in the system." 
      />
    </div>
  );
};

export default Users;
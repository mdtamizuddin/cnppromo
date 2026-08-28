import React from 'react';
import PremiumUsersTable from './components/PremiumUsersTable';

const NonActiveUsers = () => {
  return (
    <div className="container mx-auto">
      <PremiumUsersTable 
        status="pending" 
        title="Pending Approvals" 
        subtitle="Review and manage users waiting for account activation." 
      />
    </div>
  );
};

export default NonActiveUsers;

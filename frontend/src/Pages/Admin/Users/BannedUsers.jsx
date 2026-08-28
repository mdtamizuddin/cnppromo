import React from 'react';
import PremiumUsersTable from './components/PremiumUsersTable';

const BannedUsers = () => {
  return (
    <div className="container mx-auto">
      <PremiumUsersTable 
        status=""
        lock={true}
        title="Banned Users" 
        subtitle="Manage all locked and banned accounts in the system." 
      />
    </div>
  );
};

export default BannedUsers;

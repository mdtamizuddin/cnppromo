import React from 'react';
import PremiumUsersTable from './components/PremiumUsersTable';

const Users = () => {
  return (
    <div className="container mx-auto">
      <PremiumUsersTable 
        role="user"
        defaultStatus="all"
      />
    </div>
  );
};

export default Users;
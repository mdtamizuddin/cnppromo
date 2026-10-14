import React from 'react';
import PremiumUsersTable from './components/PremiumUsersTable';

const Users = () => {
  return (
    <div className="w-full">
      <PremiumUsersTable 
        role="user"
        defaultStatus="all"
      />
    </div>
  );
};

export default Users;
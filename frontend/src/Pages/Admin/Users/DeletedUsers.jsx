import React from 'react';
import PremiumUsersTable from './components/PremiumUsersTable';

const DeletedUsers = () => {
  return (
    <div className="container mx-auto">
      <PremiumUsersTable 
        status=""
        deleted={true}
        title="Deleted Users" 
        subtitle="Review deleted accounts, who removed them and why, and restore them if needed." 
      />
    </div>
  );
};

export default DeletedUsers;

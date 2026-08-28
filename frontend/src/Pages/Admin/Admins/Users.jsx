import React from 'react';
import PremiumUsersTable from '../Users/components/PremiumUsersTable';

const Admins = ({ moderator }) => {
    return (
        <div className="container mx-auto">
            <PremiumUsersTable 
                status="" 
                role={moderator ? "moderator" : "admin"}
                title={moderator ? "Moderators" : "Admins"} 
                subtitle={`Manage all ${moderator ? "moderators" : "admins"} in the system.`} 
            />
        </div>
    );
};

export default Admins;
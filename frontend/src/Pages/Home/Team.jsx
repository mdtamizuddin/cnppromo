export const Team = () => {
    return (
        <div className="px-4 py-10 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
            <div className="mx-auto mb-10 lg:max-w-xl text-center">
                <p className="inline-block px-3 py-px mb-3 text-xl font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400 text-center">
                    Meet Our Team
                </p>
            </div>
            <div className="grid gap-10 mx-auto sm:grid-cols-1 lg:grid-cols-4 md:grid-cols-2 lg:max-w-screen-lg">
                <TeamCard
                    image={"https://png.pngtree.com/png-vector/20241225/ourmid/pngtree-professional-male-avatar-in-suit-png-image_14855076.png"}
                    name={'MD Muzahidul Islam'}
                    role={'Head Of admin ( CEO)'}
                />
                <TeamCard
                    image={"https://t4.ftcdn.net/jpg/06/43/68/65/360_F_643686558_Efl6HB1ITw98bx1PdAd1wy56QpUTMh47.jpg"}
                    name={'Ohona moni priya'}
                    role={'Admin and owner'}
                />
                <TeamCard
                    image={"https://t4.ftcdn.net/jpg/07/61/35/67/360_F_761356733_9CS91hVomGiiwYBOJavKTsVYHciVezT8.jpg"}
                    name={'Promity Remeen'}
                    role={'Admin and trainer'}
                />
                <TeamCard
                    image={"https://t4.ftcdn.net/jpg/08/23/95/89/360_F_823958944_1c9covIC7Tl7eyJtWoTiXc0L4vP6f43q.jpg"}
                    name={'Fariya Umme Neha '}
                    role={'Admin and Trainer'}
                />
            </div>
        </div>
    );
};

const TeamCard = ({ name, role, image }) => {
    return <div>
        <div className="">
            <img loading="lazy" src={image} alt={name} 
                className='rounded lg:min-h-[250px] w-full object-cover capitalize border'
            />
        </div>
        <div className="flex flex-col sm:text-center mt-3">
            <p className="text-lg font-bold">{name}</p>
            <p className="mb-5 text-xs text-gray-800 capitalize">
                {role}
            </p>
        </div>
    </div>
}

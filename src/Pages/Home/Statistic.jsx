import React from "react";

const Statistic = ({ data }) => {
    const items = [
        {
            id: 1,
            title: 'Total Users',
            value: data?.total + 60000,
        },
        {
            id: 2,
            title: 'Active Users',
            value: data?.active + 53000,
        },
        {
            id: 3,
            title: 'Trainer & Admin',
            value: 10,
        },
        {
            id: 4,
            title: 'Complete Withdrawal',
            value: data?.total_withdraw + 7000000,
        }
    ]
    return (
        <div className='flex justify-center items-center lg:gap-20 gap-10 flex-wrap'>
            {
                items.map(item => <Card key={item.id} item={item} />)
            }
        </div>
    );
};

export default Statistic;

const Card = ({ item }) => {
  return (
    <div className="flex items-center justify-center flex-col ">
      <h2 className="lg:text-3xl text-xl  text-primary font-bold">
        {item.value}
      </h2>
      <h3 className="mt-1 lg:text-xl text-sm lato text-primary font-bold">
        {item.title}
      </h3>
    </div>
  );
};

import { IconButton } from '@material-tailwind/react';
import React from 'react';

const Pagination = ({ pages, setState, active }) => {
    let pageNumbers = [];
    for (let index = 0; index < (pages > 3 ? 3 : pages); index++) {
        pageNumbers.push(<IconButton onClick={() => setState(index + 1)} key={index} variant="outlined" size="sm" color={active === index + 1 ? "red" : "gray"}>
            {index + 1}
        </IconButton>);
    }
    // last 3
    let last = [];
    for (let index = 0; index < (pages > 3 ? 3 : 0); index++) {
        last.push(<IconButton onClick={() => setState((pages - 2) + index)} key={index} variant="outlined" size="sm" color={active === (pages - 2) + index ? "red" : "gray"}>
            {(pages - 2) + index}
        </IconButton>);
    }
    return (
        <div className='flex justify-center gap-2 flex-wrap'>
            {pageNumbers}
            {last}
        </div>
    )
};

export default Pagination;
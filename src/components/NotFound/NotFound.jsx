import React from 'react';
import {NavLink} from "react-router-dom";

const NotFound = () => {
    return (
        <div className='d-flex flex-column align-items-center justify-content-center vh-100 fs-1'>
            <h1>Page Not Found :(</h1>
            <div>
                <NavLink to='/' className='btn btn-info'>Go home</NavLink>
            </div>
        </div>

    );
};

export default NotFound;
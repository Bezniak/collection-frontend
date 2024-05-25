import React from 'react';
import './Preloader.css';

const Preloader = () => {
    return (
        <div className="preloader-container">
            <div className="spinner-border spin-size text-info" role="status" >
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default Preloader;

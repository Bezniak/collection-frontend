import React from 'react';
import './Preloader.css';
import {useTranslation} from "react-i18next";

const Preloader = () => {
    const {t} = useTranslation();


    return (
        <div className="preloader-container">
            <div className="spinner-border spin-size text-info" role="status">
                <span className="visually-hidden">{t("loading")}</span>
            </div>
        </div>
    );
};

export default Preloader;

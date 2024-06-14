import React from 'react';
import {NavLink} from "react-router-dom";
import {useAuth} from "../../context/AuthContext";
import {useTranslation} from "react-i18next";

const Footer = () => {
    const {user} = useAuth();
    const {t} = useTranslation();

    return (
        <div className='container text-end mt-5 mb-4'>
            {user && (
                <NavLink to='/ticket-form' className='link-info text-decoration-none'>{t("create_support_ticket")}</NavLink>
            )}
        </div>
    );
};

export default Footer;
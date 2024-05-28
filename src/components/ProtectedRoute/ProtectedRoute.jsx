import React, {useEffect} from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from "../../context/AuthContext";
import {toast} from "react-toastify";
import {useTranslation} from "react-i18next";

const ProtectedRoute = ({children, requiredRole}) => {
    const {t} = useTranslation();
    const {user, role} = useAuth();

    useEffect(() => {
        if (user && role !== requiredRole) {
            toast.warning(`${t("access_denied")}`);
        }
    }, [user, role, requiredRole]);

    if (!user) {
        return <Navigate to="/login"/>;
    }

    if (role !== requiredRole) {
        return <Navigate to="/"/>;
    }

    return children;
};

export default ProtectedRoute;

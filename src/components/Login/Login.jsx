import React, {useState} from 'react';
import {useForm} from "react-hook-form";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import api from "../utils/api";

const Login = () => {
    const {t} = useTranslation();
    const {
        register,
        handleSubmit,
        formState:
            {errors}
    } = useForm();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/local', {
                identifier: data.email,
                password: data.password
            });
            console.log('response logged in', response);
            login(response);
            navigate('/');
        } catch (error) {
            if (error?.response?.data?.error) {
                const strapiErrorMessage = error.response.data.error.message;
                setError(strapiErrorMessage);
            } else {
                setError(t("unexpected_error"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
            <form className="col-lg-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">{t("email")}</label>
                    <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                           id='email'
                           {...register('email', {
                               required: true,
                               pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                           })}
                           placeholder={t("enter_email")}
                    />
                    {errors.email && errors.email.type === 'required' && (
                        <span className="invalid-feedback">{t("field_required")}</span>
                    )}
                    {errors.email && errors.email.type === 'pattern' && (
                        <span className="invalid-feedback">{t("invalid_format")}</span>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">{t("password")}</label>
                    <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                           id='password'
                           {...register('password', {
                               required: true,
                               minLength: {
                                   value: 6,
                                   message: t("password_length"),
                               }
                           })}
                           placeholder={t("enter_password")}
                    />
                    {errors.password && errors.password.type === 'required' && (
                        <span className="invalid-feedback">{t("field_required")}</span>
                    )}
                    {errors.password && errors.password.type === 'minLength' && (
                        <span className="invalid-feedback">{errors.password.message}</span>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                <button type="submit" className="btn btn-primary w-100 mb-4"
                        disabled={isLoading}>{isLoading ? t("sending") : t("login")}</button>
            </form>
        </div>
    );
};

export default Login;

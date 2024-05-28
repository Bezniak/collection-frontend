import React, {useState} from 'react';
import {useForm} from "react-hook-form";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import api from "../utils/api";
import {v4 as uuidv4} from 'uuid';
import {Button} from "react-bootstrap";

const Register = () => {
    const {register, handleSubmit, formState: {errors}, reset} = useForm();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {login} = useAuth();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const user_id = uuidv4();
            const userData = {...data, user_id};
            const response = await api.post('/auth/local/register', userData);
            login(response);
            navigate('/');
        } catch (error) {
            console.error('Error submitting data:', error);
            if (error.response && error.response.status === 400) {
                setErrorMessage(error.response.data.error.message);
            } else {
                setErrorMessage(t('unexpected_error'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
            <form className="col-lg-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">{t('username')}</label>
                    <input type="text" className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                           id='username'
                           {...register('username', {
                               required: true,
                               placeholder: t('enter_name'),
                           })}
                    />
                    {errors.username && <span className="invalid-feedback">{t('field_required')}</span>}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">{t('email')}</label>
                    <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                           id='email'
                           {...register('email', {
                               required: true,
                               placeholder: t('enter_email'),
                               pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                           })}
                    />
                    {errors.email && errors.email.type === 'required' && (
                        <span className="invalid-feedback">{t('field_required')}</span>
                    )}
                    {errors.email && errors.email.type === 'pattern' && (
                        <span className="invalid-feedback">{t('invalid_format')}</span>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">{t('password')}</label>
                    <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                           id='password'
                           {...register('password', {
                               required: true,
                               placeholder: t('enter_password'),
                               minLength: {
                                   value: 6,
                                   message: t('password_length')
                               }
                           })}
                    />
                    {errors.password && errors.password.type === 'required' && (
                        <span className="invalid-feedback">{t('field_required')}</span>
                    )}
                    {errors.password && errors.password.type === 'minLength' && (
                        <span className="invalid-feedback">{t('password_length')}</span>
                    )}
                </div>

                <Button type="submit" className="btn btn-primary w-100 mb-4" disabled={isSubmitting}>
                    {isSubmitting ? t('submitting') : t('register')}
                </Button>
            </form>
            {errorMessage && <div className="alert alert-danger w-50 text-center">{errorMessage}</div>}
        </div>
    );
};

export default Register;

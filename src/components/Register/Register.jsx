import React, {useState} from 'react';
import {useForm} from "react-hook-form";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../context/AuthContext";
import {useNavigate} from "react-router-dom";
import api from "../utils/api";
import {v4 as uuidv4} from 'uuid';
import {Alert, Button, Container, Form} from "react-bootstrap";

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: {errors}, reset
    }
        = useForm();
    const [errorMessage, setErrorMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {login, theme} = useAuth();
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
        <Container className="vh-100 d-flex justify-content-center align-items-center">
            <Form className="col-lg-6" onSubmit={handleSubmit(onSubmit)}>
                <Form.Group controlId="username" className="mb-3">
                    <Form.Label>{t('username')}</Form.Label>
                    <Form.Control
                        type="text"
                        isInvalid={!!errors.username}
                        {...register('username', {required: true})}
                        placeholder={t('enter_name')}
                        className={`${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                    />
                    {errors.username &&
                        <Form.Control.Feedback type="invalid">{t('field_required')}</Form.Control.Feedback>}
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                    <Form.Label>{t('email')}</Form.Label>
                    <Form.Control
                        type="email"
                        isInvalid={!!errors.email}
                        {...register('email', {
                            required: true,
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        })}
                        placeholder={t('enter_email')}
                        className={`${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                    />
                    {errors.email && errors.email.type === 'required' && (
                        <Form.Control.Feedback type="invalid">{t('field_required')}</Form.Control.Feedback>
                    )}
                    {errors.email && errors.email.type === 'pattern' && (
                        <Form.Control.Feedback type="invalid">{t('invalid_format')}</Form.Control.Feedback>
                    )}
                </Form.Group>
                <Form.Group controlId="password" className="mb-3">
                    <Form.Label>{t('password')}</Form.Label>
                    <Form.Control
                        type="password"
                        isInvalid={!!errors.password}
                        {...register('password', {
                            required: true,
                            minLength: {
                                value: 6,
                                message: t('password_length')
                            }
                        })}
                        placeholder={t('enter_password')}
                        className={`${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                    />
                    {errors.password && errors.password.type === 'required' && (
                        <Form.Control.Feedback type="invalid">{t('field_required')}</Form.Control.Feedback>
                    )}
                    {errors.password && errors.password.type === 'minLength' && (
                        <Form.Control.Feedback type="invalid">{t('password_length')}</Form.Control.Feedback>
                    )}
                </Form.Group>
                <div className="text-center mt-5">
                    <Button
                        type="submit"
                        variant={`${theme === 'light' ? 'outline-dark' : 'outline-light'}`}
                        className="w-50 mb-4"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t('submitting') : t('register')}
                    </Button>
                </div>
            </Form>
            {errorMessage && <Alert variant="danger" className="w-50 text-center">{errorMessage}</Alert>}
        </Container>
    );
};

export default Register;

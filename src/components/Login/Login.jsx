import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert } from 'react-bootstrap';
import api from "../utils/api";

const Login = () => {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, theme } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/local', {
                identifier: data.email,
                password: data.password
            });
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
        <Container className="vh-100 d-flex justify-content-center align-items-center">
            <Form className={`col-lg-6 w-50`} onSubmit={handleSubmit(onSubmit)}>
                <Form.Group controlId="email" className="mb-3">
                    <Form.Label>{t("email")}</Form.Label>
                    <Form.Control type="email"
                                  {...register('email', {
                                      required: true,
                                      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  })}
                                  placeholder={t("enter_email")}
                                  isInvalid={errors.email}
                                  className={`${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email && t("field_required")}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                    <Form.Label>{t("password")}</Form.Label>
                    <Form.Control type="password"
                                  {...register('password', {
                                      required: true,
                                      minLength: {
                                          value: 6,
                                          message: t("password_length"),
                                      }
                                  })}
                                  placeholder={t("enter_password")}
                                  isInvalid={errors.password}
                                  className={`${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password && errors.password.message}</Form.Control.Feedback>
                </Form.Group>

                {error && <Alert variant="danger">{error}</Alert>}

                <div className={`text-center mt-5`}>
                    <Button type="submit" variant={`${theme === 'light' ? 'outline-dark' : 'outline-light'}`}
                            className="w-50 mb-4"
                            disabled={isLoading}
                    >
                        {isLoading ? t("sending") : t("login")}
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default Login;

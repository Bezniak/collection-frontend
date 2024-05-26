import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {NavLink} from 'react-router-dom';
import {MdOutlineLightMode, MdOutlineNightsStay} from 'react-icons/md';
import useLanguage from '../../hooks/useLanguage';
import {useAuth} from "../../context/AuthContext";
import api from "../utils/api";

const NavbarComponent = () => {
    const {t} = useTranslation();
    const {currentLanguage, changeLanguage} = useLanguage();
    const {user, logout} = useAuth();


    const handleLogout = () => {
        logout();
    };


    // useEffect(() => {
    //     const getRole = async () => {
    //         try {
    //             const response = await api.get(`/users-permissions/roles/${user.id}`);
    //             console.log('Response status:', response.status);
    //             console.log('Response data:', response.data);
    //         } catch (error) {
    //             console.error('Error fetching user role:', error);
    //         }
    //     };
    //
    //     if (user?.id) {
    //         getRole();
    //     } else {
    //         console.warn('User ID is not defined');
    //     }
    // }, [user]);

    return (
        <Navbar expand="lg" className="bg-body-tertiary">
            <Container fluid>
                <NavLink to='/' className="navbar-brand">{t("siteName")}</NavLink>
                <Navbar.Toggle aria-controls="navbarScroll"/>
                <Navbar.Collapse id="navbarScroll">
                    <Nav className="me-auto my-2 my-lg-0" style={{maxHeight: '100px'}} navbarScroll>

                        {user
                            ? <NavLink to="/" onClick={handleLogout} className="nav-link">{t("logout")}</NavLink>
                            : (
                                <>
                                    <NavLink to="/login" className="nav-link">{t("login")}</NavLink>
                                    <NavLink to="/register" className="nav-link">{t("register")}</NavLink>
                                </>
                            )
                        }


                        <NavDropdown title={t("language")} id="navbarScrollingDropdown">
                            <NavDropdown.Item onClick={() => changeLanguage('en')}>
                                <img src="/us.svg" alt="en" className="w-25 m-lg-2 object-fit-contain"/>
                                {t("english")}
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => changeLanguage('pl')}>
                                <img src="/pl.svg" alt="pl" className="w-25 m-lg-2 object-fit-contain"/>
                                {t("polish")}
                            </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title={t("theme")} id="navbarScrollingDropdown">
                            <NavDropdown.Item>
                                <MdOutlineLightMode style={{fontSize: '20'}} className='m-lg-2'/>
                                {t("light")}
                            </NavDropdown.Item>
                            <NavDropdown.Item>
                                <MdOutlineNightsStay style={{fontSize: '20'}} className='m-lg-2'/>
                                {t("dark")}
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>


                    {user && (
                        <Navbar.Collapse className="justify-content-center">
                            {t("welcome_message")}&nbsp; <NavLink to='/collections' className="nav-link">{user.username}</NavLink>
                        </Navbar.Collapse>
                    )}


                    <Form className="d-flex">
                        <Form.Control type="search" placeholder={t("search")} className="me-2" aria-label="Search"/>
                        <Button variant="outline-success">{t("search")}</Button>
                    </Form>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;

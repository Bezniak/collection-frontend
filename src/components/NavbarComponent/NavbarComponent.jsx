import React from 'react';
import {useTranslation} from 'react-i18next';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {NavLink, useNavigate} from 'react-router-dom';
import {MdOutlineLightMode, MdOutlineNightsStay} from 'react-icons/md';
import useLanguage from '../../hooks/useLanguage';
import {useAuth} from "../../context/AuthContext";
import Dropdown from 'react-bootstrap/Dropdown';
import {DropdownButton} from "react-bootstrap";

const NavbarComponent = () => {
    const {t} = useTranslation();
    const {currentLanguage, changeLanguage} = useLanguage();
    const {user, logout, role} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

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
                        <DropdownButton id="dropdown-basic-button" title="Dropdown button" variant='info'>
                            <Dropdown.Item onClick={() => handleNavigate('/collections')}>My collections</Dropdown.Item>
                            {role === 'admin' && (
                                <>
                                    <Dropdown.Divider/>
                                    <Dropdown.Item onClick={() => handleNavigate('/adminPanel')}>Admin Panel</Dropdown.Item>
                                </>
                            )}
                        </DropdownButton>
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

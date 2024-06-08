import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink, useNavigate} from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {MdOutlineLightMode, MdOutlineNightsStay} from 'react-icons/md';
import useLanguage from '../../hooks/useLanguage';
import {useAuth} from "../../context/AuthContext";
import api from "../utils/api";

const NavbarComponent = () => {
    const {t} = useTranslation();
    const {currentLanguage, changeLanguage} = useLanguage();
    const {user, logout, role, theme, toggleTheme} = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const handleLogout = () => {
        logout();
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        try {
            const response = await api.get(process.env.REACT_APP_API_URL + '/search', {
                params: {query}
            });
            // Only show items and collections
            const {items, collections} = response;
            const results = [...items, ...collections.map(collection => ({
                ...collection,
                isCollection: true
            }))];
            navigate('/search', {state: {results}});
            setQuery('')
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Navbar expand="lg" className={`p-4 ${theme === 'light' ? 'navbar-light bg-dark' : 'navbar-dark bg-dark'}`}>
            <Container fluid>
                <NavLink to='/'
                         className={`navbar-brand ${theme === 'light' ? 'text-light' : 'text-light'}`}>{t("siteName")}</NavLink>
                <Navbar.Toggle aria-controls="navbarScroll"
                               className={`${theme === 'light' ? 'bg-light' : 'bg-light'}`}/>
                <Navbar.Collapse id="navbarScroll">
                    <Nav className={`me-auto my-2 my-lg-0 ${theme === 'light' ? 'navbar-dark' : 'navbar-light'}`}
                         style={{maxHeight: '100px'}} navbarScroll>
                        {user
                            ? <NavLink to="/" onClick={handleLogout} className={`nav-link `}>{t("logout")}</NavLink>
                            : (
                                <>
                                    <NavLink to="/login" className={`nav-link`}>{t("login")}</NavLink>
                                    <NavLink to="/register" className={`nav-link `}>{t("register")}</NavLink>
                                </>
                            )
                        }
                        <NavDropdown title={t("language")} id="languageDropdown"
                                     className={`${theme === 'light' ? 'navbar-dark' : 'navbar-light'}`}>
                            <NavDropdown.Item onClick={() => changeLanguage('en')}>
                                <img src="/us.svg" alt="en" className="img-fluid w-25 m-lg-2 object-fit-contain"/>
                                {t("english")}
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={() => changeLanguage('pl')}>
                                <img src="/pl.svg" alt="pl" className="img-fluid w-25 m-lg-2 object-fit-contain"/>
                                {t("polish")}
                            </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title={t("theme")} id="navbarScrollingDropdown"
                                     className={`${theme === 'light' ? 'text-dark' : 'text-light'}`}>
                            <NavDropdown.Item onClick={toggleTheme}>
                                {theme === 'light' ? (
                                    <>
                                        <MdOutlineNightsStay style={{fontSize: '20'}} className='m-lg-2'/>
                                        {t("dark")}
                                    </>
                                ) : (
                                    <>
                                        <MdOutlineLightMode style={{fontSize: '20'}} className='m-lg-2'/>
                                        {t("light")}
                                    </>
                                )}
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav className={`me-auto my-2 my-lg-0 ${theme === 'light' ? 'navbar-dark' : 'navbar-light'}`}
                         style={{maxHeight: '100px'}} navbarScroll>
                        {user && (
                            <NavDropdown title={t("welcome_message") + user.username}
                                         id="dropdown-basic-button"
                                         variant='info'
                                         style={{marginRight: "5%"}}
                            >

                                <NavDropdown.Item onClick={() => handleNavigate('/user-profile')}>
                                    {t("my_profile")}
                                </NavDropdown.Item>

                                <NavDropdown.Item onClick={() => handleNavigate('/collections')}>
                                    {t("my_collections")}
                                </NavDropdown.Item>
                                {role === 'admin' && (
                                    <>
                                        <NavDropdown.Divider/>
                                        <NavDropdown.Item onClick={() => handleNavigate('/adminPanel')}>
                                            {t("admin_panel")}
                                        </NavDropdown.Item>
                                    </>
                                )}



                            </NavDropdown>
                        )}
                    </Nav>
                    <Form className={`d-flex`} onSubmit={handleSearch}>
                        <Form.Control
                            type="search"
                            placeholder={t("search")}
                            className={`me-2 bg-dark text-light`}
                            aria-label="Search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Button variant="outline-light" type="submit">{t("search")}</Button>
                    </Form>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;

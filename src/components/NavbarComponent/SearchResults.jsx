import React from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import {useAuth} from "../../context/AuthContext";

const SearchResults = () => {
    const {t} = useTranslation();
    const location = useLocation();
    const results = location.state?.results || [];
    const {theme} = useAuth();

    return (
        <Container className='mt-5'>
            <h1 className="text-center">{t('searchResults')}</h1>
            {results.length ? (
                <ListGroup variant="flush" className={`mt-4`}>
                    {results.map((result) => (
                        <ListGroup.Item key={result.id}
                                        className={`my-2 p-3 shadow-sm rounded ${theme === 'light' ? 'bg-light' : 'bg-dark'}`}>
                            <Card className={`border-0 ${theme === 'light' ? 'bg-light' : 'bg-dark'}`}>
                                <Card.Body>
                                    <Card.Title>
                                        {result.isCollection ? (
                                            <NavLink to={`/collection/${result.id}`}
                                                     className={`text-decoration-none ${theme === 'light' ? 'text-dark' : 'text-light'}`}>
                                                {result.name}
                                            </NavLink>
                                        ) : (
                                            <NavLink to={`/item/${result.id}`}
                                                     className={`text-decoration-none ${theme === 'light' ? 'text-dark' : 'text-light'}`}>
                                                {result.name}
                                            </NavLink>
                                        )}
                                    </Card.Title>
                                </Card.Body>
                            </Card>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            ) : (
                <p className="text-center text-muted mt-4">{t('noResults')}</p>
            )}
        </Container>
    );
};

export default SearchResults;

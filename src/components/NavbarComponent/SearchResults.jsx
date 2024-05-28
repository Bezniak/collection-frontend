import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import './SearchResults.css';

const SearchResults = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const results = location.state?.results || [];

    console.log('result', results)

    return (
        <Container className="my-4">
            <h1 className="text-center">{t('searchResults')}</h1>
            {results.length ? (
                <ListGroup variant="flush" className="mt-4">
                    {results.map((result) => (
                        <ListGroup.Item key={result.id} className="my-2 p-3 shadow-sm rounded">
                            <Card className="border-0">
                                <Card.Body>
                                    <Card.Title>
                                        {result.isCollection ? (
                                            <NavLink to={`/collection/${result.id}`} className="text-decoration-none">
                                                {result.name}
                                            </NavLink>
                                        ) : (
                                            <NavLink to={`/item/${result.id}`} className="text-decoration-none">
                                                {result.name}
                                            </NavLink>
                                        )}
                                    </Card.Title>
                                    <Card.Text className="text-muted">
                                        {result.description || t('noDescription')}
                                    </Card.Text>
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

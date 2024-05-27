import React from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

const SearchResults = () => {
    const {t} = useTranslation();
    const location = useLocation();
    const {results} = location.state || {results: []};

    return (
        <div>
            <h1>{t('searchResults')}</h1>
            {results.length ? (
                <ul>
                    {results.map((result) => (
                        <li key={result.id}>
                            <NavLink to={`/item/${result.id}`}>{result.name}</NavLink>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>{t('noResults')}</p>
            )}
        </div>
    );
};

export default SearchResults;

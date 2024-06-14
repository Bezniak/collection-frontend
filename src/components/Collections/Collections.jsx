import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import Preloader from '../Preloader/Preloader';
import api from '../utils/api';
import {useAuth} from '../../context/AuthContext';
import {MdOutlineImageNotSupported} from 'react-icons/md';
import {formatDate} from '../utils/formatDate';
import {Alert, Button, Container, Image, Table} from 'react-bootstrap';
import {useTranslation} from 'react-i18next';
import Papa from 'papaparse';

const Collections = ({collections: propCollections}) => {
    const {t} = useTranslation();
    const {userId} = useParams();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {user, role, theme} = useAuth();


    useEffect(() => {
        const fetchCollections = async () => {
            try {
                let collectionsResponse;
                if (userId) {
                    collectionsResponse = await api.get(`/collections?filters[user][id][$eq]=${userId}&populate=*`);
                } else if (user && user.id) {
                    collectionsResponse = await api.get(`/collections?filters[user][id][$eq]=${user.id}&populate=*`);
                }
                if (collectionsResponse && collectionsResponse.data) {
                    setCollections(collectionsResponse.data);
                } else {
                    setCollections([]);
                }
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchCollections();
    }, [userId, user]);


    const handleDelete = async (id) => {
        try {
            await api.delete(`/collections/${id}`);
            setCollections(collections.filter(collection => collection.id !== id));
        } catch (error) {
            setError(error);
        }
    };

    const handleExportToCSV = () => {
        const csvData = collections.map(collection => {
            const {attributes} = collection;
            const items = attributes.items?.data.map(item => item.attributes) || [];
            const additionalFields = items.map(item => item.additionalFields).flat();

            return {
                ID: collection.id,
                Name: attributes?.name,
                Description: attributes?.description,
                Category: attributes?.category,
                ItemsCount: attributes?.items?.data?.length,
                PublishedAt: formatDate(attributes?.publishedAt),
                UpdatedAt: formatDate(attributes?.updatedAt),
                User: attributes?.user?.data?.attributes?.username,
                ImageUrl: attributes?.image_url?.data ? process.env.REACT_APP_UPLOAD_URL + attributes?.image_url?.data?.attributes?.url : '',
                AdditionalFields: JSON.stringify(additionalFields),
            };
        });

        const csv = Papa.unparse(csvData, {
            header: true,
        });

        const blob = new Blob(["\uFEFF" + csv], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'collections.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <Preloader/>;
    }

    if (error) {
        return (
            <div>
                <Alert variant="danger" className="w-25 m-5 d-flex justify-content-center align-items-center">
                    Error: {error.message}
                </Alert>
            </div>
        );
    }

    return (
        <Container fluid="md">
            <h1 className="my-4 text-center">{t("my_collections")}</h1>
            <div className="d-flex justify-content-center mb-4">
                <Link to="/edit-collection/new" className="btn btn-primary me-3">{t("create_collection")}</Link>
                <Button onClick={handleExportToCSV} className="btn-secondary">{t("export_to_csv")}</Button>
            </div>
            {collections.length === 0 ? (
                <p className="text-center">{t("no_collections")}</p>
            ) : (
                <Table striped bordered hover responsive
                       className={`text-center ${theme === 'light' ? 'table-light' : 'table-dark'}`}>
                    <thead>
                    <tr>
                        <th>{t("id")}</th>
                        <th>{t("image")}</th>
                        <th>{t("collection_name")}</th>
                        <th>{t("description")}</th>
                        <th>{t("category")}</th>
                        <th>{t("items_count")}</th>
                        <th>{t("publication_date")}</th>
                        <th>{t("last_modified_date")}</th>
                        <th>{t("actions")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {collections.map(collection => (
                        <tr key={collection.id}>
                            <td>{collection.id}</td>
                            <td style={{textAlign: "center", verticalAlign: "middle"}}>
                                {collection.attributes?.image_url?.data ? (
                                    <Image
                                        src={process.env.REACT_APP_UPLOAD_URL + collection.attributes?.image_url?.data?.attributes?.url}
                                        alt={collection.attributes?.image_url?.data?.attributes?.name}
                                        className="custom-image"
                                        rounded
                                    />
                                ) : (
                                    <MdOutlineImageNotSupported style={{fontSize: "30px"}}/>
                                )}
                            </td>
                            <td>{collection.attributes?.name}</td>
                            <td>{collection.attributes?.description}</td>
                            <td>{collection.attributes?.category}</td>
                            <td>{collection.attributes?.items?.data?.length}</td>
                            <td>{formatDate(collection.attributes?.publishedAt)}</td>
                            <td>{formatDate(collection.attributes?.updatedAt)}</td>
                            <td>
                                <div className='d-flex justify-content-center align-items-start'>
                                    <Link to={`/collection/${collection.id}`} className="btn btn-info btn-sm me-3 p-2">
                                        {t("open")}
                                    </Link>
                                    {(user?.id === collection.attributes?.user?.data?.id || role === 'admin') && (
                                        <>
                                            <Link to={`/edit-collection/${collection.id}`}
                                                  className="btn btn-warning btn-sm me-3 p-2">
                                                {t("edit")}
                                            </Link>
                                            <Button variant="danger" size="sm" className='p-2'
                                                    onClick={() => handleDelete(collection.id)}>
                                                {t("delete")}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default Collections;

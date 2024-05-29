import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import Preloader from '../Preloader/Preloader';
import api from "../utils/api";
import {useAuth} from "../../context/AuthContext";
import {MdOutlineImageNotSupported} from "react-icons/md";
import {formatDate} from "../utils/formatDate";
import {Alert, Button, Container, Image, Table} from 'react-bootstrap';
import {useTranslation} from "react-i18next";


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
                } else {
                    collectionsResponse = await api.get(`/collections?filters[user][id][$eq]=${user.id}&populate=*`);
                }
                setCollections(collectionsResponse.data || []);
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
                <Link to="/edit-collection/new" className="btn btn-primary">{t("create_collection")}</Link>
            </div>
            {collections.length === 0 ? (
                <p className="text-center">{t("no_collections")}</p>
            ) : (
                <Table striped bordered hover responsive className={`text-center ${theme === 'light' ? 'table-light' : 'table-dark'}`}>
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

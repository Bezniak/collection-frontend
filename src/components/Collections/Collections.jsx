import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Preloader from '../Preloader/Preloader';
import api from "../utils/api";
import { useAuth } from "../../context/AuthContext";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { formatDate } from "../utils/formatDate";
import { Table, Button, Container } from 'react-bootstrap';

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchRoleAndCollections = async () => {
            try {
                let collectionsResponse = await api.get(`/collections?populate=*`);
                setCollections(collectionsResponse.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching role and collections:", error);
                setLoading(false);
            }
        };

        fetchRoleAndCollections();
    }, [user]);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/collections/${id}`);
            setCollections(collections.filter(collection => collection.id !== id));
        } catch (error) {
            console.error("Error deleting collection:", error);
        }
    };

    if (loading) {
        return <Preloader />;
    }

    return (
        <Container fluid="md" style={{ width: '80%' }}>
            <h1 className="my-4 text-center">Мои коллекции</h1>
            <div className="d-flex justify-content-center mb-4">
                <Link to="/edit-collection/new" className="btn btn-primary">Создать новую коллекцию</Link>
            </div>
            {collections.length === 0 ? (
                <p className="text-center">У вас нет коллекций.</p>
            ) : (
                <Table striped bordered hover responsive className="text-center">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Collection name</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Items count</th>
                        <th>Publication date</th>
                        <th>Last modified date</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {collections.map(collection => (
                        <tr key={collection.id}>
                            <td>{collection.id}</td>
                            <td className="text-center align-middle">
                                {collection.attributes?.image_url?.data ? (
                                    <img
                                        src={process.env.REACT_APP_UPLOAD_URL + collection.attributes?.image_url?.data?.attributes?.url}
                                        alt={collection.attributes?.image_url?.data?.attributes?.name}
                                        className="img-fluid"
                                        style={{ width: '80px' }}
                                    />
                                ) : (
                                    <MdOutlineImageNotSupported size={32} />
                                )}
                            </td>
                            <td className="text-center align-middle">{collection.attributes?.name}</td>
                            <td className="text-center align-middle">{collection.attributes?.description}</td>
                            <td className="text-center align-middle">{collection.attributes?.category}</td>
                            <td className="text-center align-middle">{collection.attributes?.items?.data?.length}</td>
                            <td className="text-center align-middle">{formatDate(collection.attributes?.publishedAt)}</td>
                            <td className="text-center align-middle">{formatDate(collection.attributes?.updatedAt)}</td>
                            <td className="text-center align-middle">
                                <div className='d-flex justify-content-center'>
                                    <Link to={`/collection/${collection.id}`} className="btn btn-info btn-sm me-2">
                                        Открыть
                                    </Link>
                                    {(user?.user_id === collection.attributes?.user_id) && (
                                        <>
                                            <Link to={`/edit-collection/${collection.id}`} className="btn btn-warning btn-sm me-2">
                                                Редактировать
                                            </Link>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(collection.id)}>
                                                Удалить
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

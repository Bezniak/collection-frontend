import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {Alert, Button, Dropdown, DropdownButton, Image, Table} from 'react-bootstrap';
import api from "../utils/api";
import {formatDate} from "../utils/formatDate";
import {useAuth} from "../../context/AuthContext";
import {MdOutlineImageNotSupported} from "react-icons/md";
import Container from "react-bootstrap/Container";
import Preloader from "../Preloader/Preloader";

const Collection = ({collection: propCollection, items: propItems}) => {
    const {id} = useParams();
    const [collection, setCollection] = useState(propCollection || null);
    const [items, setItems] = useState(propItems || []);
    const [loading, setLoading] = useState(!propCollection || !propItems);
    const [error, setError] = useState(null);
    const {user, role} = useAuth();
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('ascending');

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const response = await api.get(`/collections/${id}?populate=*`);
                setCollection(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        const fetchItems = async () => {
            try {
                const response = await api.get(`/items?filters[collection][id][$eq]=${id}&populate=*`);
                setItems(response.data);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        if (!propCollection) {
            fetchCollection();
        }
        if (!propItems) {
            fetchItems();
        }
    }, [id, propCollection, propItems]);

    const handleDelete = async (itemId) => {
        try {
            await api.delete(`/items/${itemId}`);
            setItems(items.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleSortFieldChange = (field) => {
        setSortField(field);
    };

    const handleSortDirectionChange = (direction) => {
        setSortDirection(direction);
    };

    const sortedItems = [...items].sort((a, b) => {
        const aValue = a.attributes[sortField];
        const bValue = b.attributes[sortField];

        if (aValue < bValue) {
            return sortDirection === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortDirection === 'ascending' ? 1 : -1;
        }
        return 0;
    });

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
        <Container fluid="md" style={{width: '90%'}}>
            <h1 className='text-center mt-5'>Коллекция: {collection.attributes.name}</h1>
            <p className='text-center'>{collection.attributes.description}</p>
            {
                (user?.user_id === collection.attributes?.user_id) &&
                <div className='mt-4 mb-5 text-center'>
                    <Link to={`/edit-item/new?collection=${id}`} className="w-25 btn btn-warning me-2">
                        Добавить новый айтем
                    </Link>
                </div>
            }

            <div className="d-flex justify-content-end mb-4">
                <DropdownButton id="dropdown-basic-button" title={`Sort by: ${sortField}`}>
                    <Dropdown.Item onClick={() => handleSortFieldChange('id')}>ID</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortFieldChange('name')}>Name</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortFieldChange('user_name')}>Created by</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortFieldChange('publishedAt')}>Publication date</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortFieldChange('updatedAt')}>Last modified date</Dropdown.Item>
                </DropdownButton>
                <DropdownButton id="dropdown-basic-button" title={`Direction: ${sortDirection}`} className="ms-2">
                    <Dropdown.Item onClick={() => handleSortDirectionChange('ascending')}>Ascending</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortDirectionChange('descending')}>Descending</Dropdown.Item>
                </DropdownButton>
            </div>

            {items && (
                <Table striped bordered hover>
                    <thead>
                    <tr className='text-center'>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Created by</th>
                        <th>Publication date</th>
                        <th>Last modified date</th>
                        <th>Tags</th>
                        {collection.attributes.fields && Object.keys(collection.attributes.fields).map(key => (
                            collection.attributes.fields[key] !== 'text' && <th key={key}>{key}</th>
                        ))}
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedItems.map(item => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>
                                {item.attributes?.image_url?.data ? (
                                    <Image
                                        src={process.env.REACT_APP_UPLOAD_URL + item.attributes?.image_url?.data?.attributes?.url}
                                        alt={collection.attributes?.image_url?.data?.attributes?.name}
                                        style={{width: '80px'}}
                                        rounded
                                    />
                                ) : (
                                    <MdOutlineImageNotSupported/>
                                )}
                            </td>
                            <td>{item.attributes.name}</td>
                            <td>{item.attributes.user_name}</td>
                            <td>{formatDate(item.attributes?.publishedAt)}</td>
                            <td>{formatDate(item.attributes?.updatedAt)}</td>
                            <td>{item.attributes.tags}</td>
                            {collection.attributes.fields && Object.keys(collection.attributes.fields).map(key => (
                                collection.attributes.fields[key] !== 'text' && (
                                    <td key={key}>
                                        {collection.attributes.fields[key] === 'boolean' ?
                                            (item.attributes.additionalFields[key] ? 'Да' : 'Нет') :
                                            item.attributes.additionalFields[key]
                                        }
                                    </td>
                                )
                            ))}
                            <td>
                                <Link to={`/item/${item.id}`}
                                      className="w-100 mb-2 btn btn-info btn-sm me-2">Открыть</Link>
                                {(user?.id === collection.attributes?.user?.data?.id || role === 'admin') && (
                                    <>
                                        <Link to={`/edit-item/${item.id}?collection=${id}`}
                                              className="w-100 mb-2 btn btn-warning btn-sm me-2">Редактировать</Link>
                                        <Button variant="danger" size="sm" className='w-100'
                                                onClick={() => handleDelete(item.id)}>Удалить</Button>
                                    </>
                                )}
                            </td>

                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default Collection;

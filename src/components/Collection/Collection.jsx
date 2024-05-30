import React, {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {Alert, Button, Dropdown, DropdownButton, Image, Table} from 'react-bootstrap';
import api from "../utils/api";
import {formatDate} from "../utils/formatDate";
import {useAuth} from "../../context/AuthContext";
import {MdOutlineImageNotSupported} from "react-icons/md";
import Container from "react-bootstrap/Container";
import Preloader from "../Preloader/Preloader";
import {useTranslation} from "react-i18next";

const Collection = ({collection: propCollection, items: propItems}) => {
    const {t} = useTranslation();
    const {id} = useParams();
    const [collection, setCollection] = useState(propCollection || null);
    const [items, setItems] = useState(propItems || []);
    const [loading, setLoading] = useState(!propCollection || !propItems);
    const [error, setError] = useState(null);
    const {user, role, theme} = useAuth();
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
        <Container fluid="md" className='mt-5 mb-5'>
            <h1 className='text-center'>{t("collection")}: {collection.attributes.name}</h1>
            <p className='text-center'>{collection.attributes.description}</p>
            {user?.user_id === collection.attributes?.user_id &&
                <div className='mt-4 mb-5 text-center'>
                    <Link to={`/edit-item/new?collection=${id}`} className="w-25 btn btn-warning me-2">
                        {t("add_a_new_item")}
                    </Link>
                </div>
            }
            <div className="d-flex justify-content-end mb-4">
                <DropdownButton id="dropdown-basic-button" title={`${t("sort_by")}: ${sortField}`}>
                    <Dropdown.Item onClick={() => handleSortFieldChange('id')}>{t("id")}</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortFieldChange('name')}>{t("username")}</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleSortFieldChange('user_name')}>{t("created_by")}</Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => handleSortFieldChange('publishedAt')}>{t("publication_date")}</Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => handleSortFieldChange('updatedAt')}>{t("last_modified_date")}</Dropdown.Item>
                </DropdownButton>
                <DropdownButton id="dropdown-basic-button" title={`${t("direction")}: ${sortDirection}`}
                                className="ms-2">
                    <Dropdown.Item
                        onClick={() => handleSortDirectionChange('ascending')}>{t("ascending")}</Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => handleSortDirectionChange('descending')}>{t("descending")}</Dropdown.Item>
                </DropdownButton>
            </div>

            {items && (
                <Table striped bordered hover className={`table ${theme === 'light' ? 'table-light' : 'table-dark'}`}>
                    <thead>
                    <tr className='text-center'>
                        <th>{t("id")}</th>
                        <th>{t("image")}</th>
                        <th>{t("username")}</th>
                        <th>{t("created_by")}</th>
                        <th>{t("publication_date")}</th>
                        <th>{t("last_modified_date")}</th>
                        <th>{t("tags")}</th>
                        {collection.attributes.fields && Object.keys(collection.attributes.fields).map(key => (
                            collection.attributes.fields[key] !== 'text' && <th key={key}>{key}</th>
                        ))}
                        <th>{t("actions")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedItems.map(item => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td style={{textAlign: "center", verticalAlign: "middle"}}>
                                {item.attributes?.image_url?.data ? (
                                    <Image
                                        src={item.attributes?.image_url?.data?.attributes?.url}
                                        alt={collection.attributes?.image_url?.data?.attributes?.name}
                                        className="custom-image"
                                        rounded
                                    />
                                ) : (
                                    <MdOutlineImageNotSupported style={{fontSize: "30px"}}/>
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
                                            (item.attributes.additionalFields[key] ? t("yes") : t("no")) :
                                            item.attributes.additionalFields[key]
                                        }
                                    </td>
                                )
                            ))}
                            <td>
                                <div className='d-flex justify-content-center align-items-start'>
                                    <Link to={`/item/${item.id}`}
                                          className="btn btn-info btn-sm me-3 p-2">{t("open")}</Link>
                                    {(user?.id === collection.attributes?.user?.data?.id || role === 'admin') && (
                                        <>
                                            <Link to={`/edit-item/${item.id}?collection=${id}`}
                                                  className="btn btn-warning btn-sm me-3 p-2">{t("edit")}</Link>
                                            <Button variant="danger" size="sm" className='p-2'
                                                    onClick={() => handleDelete(item.id)}>{t("delete")}</Button>
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

export default Collection;

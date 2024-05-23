import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import Preloader from '../Preloader/Preloader';
import api from "../utils/api";
import {useAuth} from "../../context/AuthContext";
import {MdOutlineImageNotSupported} from "react-icons/md";
import {formatDate} from "../utils/formatDate";

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const {user} = useAuth();

    useEffect(() => {
        const fetchRoleAndCollections = async () => {
            try {
                let collectionsResponse = await api.get(`/collections?filters[user_id][$eq]=${user.user_id}&populate=*`);
                setCollections(collectionsResponse.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching role and collections:", error);
                setLoading(false);
            }
        };

        fetchRoleAndCollections();
    }, [user]);

    console.log('collections', collections)


    const handleDelete = async (id) => {
        try {
            await api.delete(`/collections/${id}`);
            setCollections(collections.filter(collection => collection.id !== id));
        } catch (error) {
            console.error("Error deleting collection:", error);
        }
    };

    if (loading) {
        return <Preloader/>;
    }

    return (
        <div>
            <h1>Мои коллекции</h1>
            <Link to="/edit-collection/new">Создать новую коллекцию</Link>
            {collections.length === 0 ? (
                <p>У вас нет коллекций.</p>
            ) : (
                <table>
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
                            <td>
                                {collection.attributes?.image_url?.data ? (
                                        <img
                                            src={process.env.REACT_APP_UPLOAD_URL + collection.attributes?.image_url?.data?.attributes?.url}
                                            alt={collection.attributes?.image_url?.data?.attributes?.name}
                                            style={{width: '80px'}}
                                        />
                                ) : (
                                    <MdOutlineImageNotSupported/>
                                )}
                            </td>
                            <td>{collection.attributes?.name}</td>
                            <td>{collection.attributes?.description}</td>
                            <td>{collection.attributes?.category}</td>
                            <td>{collection.attributes?.items?.data?.length}</td>
                            <td>{formatDate(collection.attributes?.publishedAt)}</td>
                            <td>{formatDate(collection.attributes?.updatedAt)}</td>
                            <td>
                                <Link to={`/collection/${collection.id}`}>Открыть</Link>
                                {(user?.user_id === collection.attributes?.user_id) && (
                                    <>
                                        <Link to={`/edit-collection/${collection.id}`}>Редактировать</Link>
                                        <button onClick={() => handleDelete(collection.id)}>Удалить</button>
                                    </>
                                )}

                            </td>
                        </tr>
                    ))}

                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Collections;

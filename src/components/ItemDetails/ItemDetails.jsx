import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import api from "../utils/api";
import {formatDate} from '../utils/formatDate';
import {MdOutlineFavorite, MdOutlineFavoriteBorder} from "react-icons/md";
import {useAuth} from "../../context/AuthContext";

const ItemDetails = () => {
    const {id} = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likeId, setLikeId] = useState(null);
    const {user} = useAuth();


    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await api.get(`/items/${id}?populate=*`);
                setItem(response.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        const fetchLikeStatus = async () => {
            if (user) {
                try {
                    const response = await api.get(`/likes?filters[item][id][$eq]=${id}&filters[user_liked_id][$eq]=${user.user_id}`);
                    if (response.data && response.data.length > 0) {
                        setLiked(true);
                        setLikeId(response.data[0].id);
                    } else {
                        setLiked(false);
                        setLikeId(null);
                    }
                } catch (error) {
                    console.error('Error fetching like status:', error);
                }
            }
        };

        fetchItem();
        fetchLikeStatus();
    }, [id, user]);


    const handleLike = async () => {
        if (!user) return;

        if (liked) {
            if (!likeId) {
                console.error('Error: likeId is not defined');
                return;
            }
            try {
                console.log(`Deleting like with id: ${likeId}`);
                await api.delete(`/likes/${likeId}`);
                console.log(`Successfully deleted like with id: ${likeId}`);
                setLiked(false);
                setLikeId(null);
            } catch (error) {
                console.error('Error deleting like:', error.response ? error.response.data : error.message);
            }
        } else {
            try {
                const response = await api.post('/likes', {
                    data: {
                        user_liked_id: user.user_id,
                        user: user.id,
                        item: id,
                        user_favorite_item: {
                            user_liked_id: user.user_id,
                            item: id,
                        }
                    },
                });
                console.log('response.data post', response.data)
                setLiked(true);
                setLikeId(response.data.id);
                console.log(`Successfully added like with id: ${response.data.id}`);
            } catch (error) {
                console.error('Error adding like:', error.response ? error.response.data : error.message);
            }
        }
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!item) {
        return <div>No item data found.</div>;
    }

    const formatFieldValue = (value) => {
        if (typeof value === 'string' && !isNaN(Date.parse(value))) {
            return formatDate(value);
        }
        return value === true ? 'Да' : value === false ? 'Нет' : value;
    };

    return (
        <div className="container mt-5">
            <div className="row align-items-center position-relative">
                <div className="col-md-4">
                    <img
                        src={process.env.REACT_APP_UPLOAD_URL + item?.attributes?.image_url?.data?.attributes?.url}
                        alt={item?.attributes?.image_url?.data?.attributes?.name}
                        className="img-fluid rounded"
                        style={{width: '100%', height: 'auto'}}
                    />
                </div>
                <div className="col-md-6 d-flex flex-column justify-content-center">
                    <div>
                        <h1 className="mt-3 text-capitalize">{item.attributes.name}</h1>
                        <p>Тэги: {item.attributes.tags}</p>
                        {item.attributes.additionalFields && Object.keys(item.attributes.additionalFields).map(key => (
                            <p key={key}>
                                <strong
                                    className='text-capitalize'>{key}:</strong> {formatFieldValue(item.attributes.additionalFields[key])}
                            </p>
                        ))}
                    </div>
                    <div className="position-absolute top-0 end-0 m-3">
                        {liked ? (
                            <MdOutlineFavorite
                                size={35}
                                style={{borderColor: '#000', fill: '#fd3040', cursor: 'pointer'}}
                                onClick={handleLike}
                            />
                        ) : (
                            <MdOutlineFavoriteBorder
                                size={35}
                                style={{borderColor: '#000', cursor: 'pointer'}}
                                onClick={handleLike}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;

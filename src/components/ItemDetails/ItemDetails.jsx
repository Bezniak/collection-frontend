import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import api from "../utils/api";
import {formatDate} from '../utils/formatDate';
import {MdOutlineFavorite, MdOutlineFavoriteBorder} from "react-icons/md";

const ItemDetails = () => {
    const {id} = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liked, setLiked] = useState(false);

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

        fetchItem();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
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
                            />
                        ) : (
                            <MdOutlineFavoriteBorder
                                size={35}
                                style={{borderColor: '#000', cursor: 'pointer'}}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;

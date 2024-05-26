import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import api from "../utils/api";
import {formatDate} from '../utils/formatDate';
import LikeHandler from "../LikeHandler/LikeHandler";
import './ItemDetails.css';
import Comment from "../Comment/Comment";
import Preloader from "../Preloader/Preloader"; // Create a separate CSS file for custom styles

const ItemDetails = () => {
    const {id} = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        return <Preloader/>
    }

    if (error) {
        return <div className="alert alert-danger text-center mt-5">Error: {error.message}</div>;
    }

    if (!item) {
        return <div className="alert alert-warning text-center mt-5">No item data found.</div>;
    }

    const formatFieldValue = (value) => {
        if (typeof value === 'string' && !isNaN(Date.parse(value))) {
            return formatDate(value);
        }
        return value === true ? 'Да' : value === false ? 'Нет' : value;
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="row mb-5 align-items-center position-relative bg-light p-4 rounded shadow">
                <div className="col-md-4 text-center">
                    <img
                        src={process.env.REACT_APP_UPLOAD_URL + item?.attributes?.image_url?.data?.attributes?.url}
                        alt={item?.attributes?.image_url?.data?.attributes?.name}
                        className="img-fluid rounded shadow-sm"
                        style={{maxWidth: '100%', height: 'auto'}}
                    />
                </div>
                <div className="col-md-8 d-flex flex-column justify-content-start">
                    <div className="text-start text-md-left">
                        <h1 className="mt-3 text-capitalize">{item.attributes.name}</h1>
                        <p className="text-muted">Тэги: {item.attributes.tags}</p>
                        {item.attributes.additionalFields && Object.keys(item.attributes.additionalFields).map(key => (
                            <p key={key} className="mb-2">
                                <strong>{key}:</strong> {formatFieldValue(item.attributes.additionalFields[key])}
                            </p>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <LikeHandler itemId={id}/>
                    </div>
                </div>
            </div>
            <Comment itemId={id}/>
        </div>
    );
};

export default ItemDetails;

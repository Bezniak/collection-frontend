import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import api from "../utils/api";
import {formatDate} from '../utils/formatDate';
import LikeHandler from "../LikeHandler/LikeHandler";
import Comment from "../Comment/Comment";
import Preloader from "../Preloader/Preloader";
import {useTranslation} from "react-i18next";
import {Alert} from "react-bootstrap";
import {HiOutlinePhoto} from "react-icons/hi2";
import {useAuth} from "../../context/AuthContext";

const ItemDetails = () => {
    const {t} = useTranslation();
    const {id} = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {theme} = useAuth();

    console.log('item', item)

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
        return (
            <div>
                <Alert variant="danger" className="w-25 m-5 d-flex justify-content-center align-items-center">
                    Error: {error.message}
                </Alert>
            </div>
        );
    }

    if (!item) {
        return <div className="alert alert-warning text-center mt-5">{t("no_item_data_found")}</div>;
    }

    const formatFieldValue = (value) => {
        if (typeof value === 'string' && !isNaN(Date.parse(value))) {
            return formatDate(value);
        }
        return value === true ? t("yes") : value === false ? t("no") : value;
    };

    return (
        <div className="container mt-5 mb-5">
            <div
                className={`row mb-5 align-items-center position-relative p-4 rounded shadow ${theme === 'light' ? 'bg-light' : 'bg-dark'}`}>
                <div className="col-md-4 text-center">
                    {item?.attributes?.image_url?.data?.attributes?.url ? (
                        <img
                            src={process.env.REACT_APP_UPLOAD_URL + item?.attributes?.image_url?.data?.attributes?.url}
                            alt={item?.attributes?.image_url?.data?.attributes?.name}
                            className="img-fluid rounded shadow-sm"
                            style={{maxWidth: '100%', height: 'auto'}}
                        />
                    ) : (
                        <HiOutlinePhoto style={{width: '50%', height: 'auto', color: "lightgray"}}/>
                    )}
                </div>

                <div className="col-md-8 d-flex flex-column justify-content-start">
                    <div className="text-start text-md-left">
                        <h1 className="mt-3 text-capitalize"
                            style={{wordBreak: 'break-word'}}>{item.attributes.name}</h1>
                        <p className="">{t("tags")}: {item.attributes.tags}</p>
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

import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Button, Container, Form} from 'react-bootstrap';
import api from "../utils/api";
import {useAuth} from "../../context/AuthContext";
import {useTranslation} from "react-i18next";
import Preloader from "../Preloader/Preloader";

const EditCollection = () => {
    const {t} = useTranslation();
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();
    const [image, setImage] = useState(null);
    const [collection, setCollection] = useState({
        name: '',
        description: '',
        category: 'Other',
        image_url: null,
        fields: {},
        additionalFields: []
    });
    const [loadingData, setLoadingData] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id !== 'new') {
            setLoadingData(true);
            api.get(`/collections/${id}?populate=*`)
                .then(response => {
                    if (response?.data?.attributes) {
                        const data = response?.data?.attributes;
                        setCollection({
                            name: data.name || '',
                            description: data.description || '',
                            category: data.category || 'Other',
                            fields: data.fields || {},
                            additionalFields: Object.entries(data.fields || {}).map(([key, value]) => ({
                                name: key,
                                type: value
                            })),
                            image_url: data.image_url ? data.image_url.url : null
                        });
                        setError(null);
                    } else {
                        console.error("Response structure is incorrect", response);
                        setError(t("error_loading_data"));
                    }
                })
                .catch(error => {
                    console.error(error);
                    setError(t("error_loading_data"));
                })
                .finally(() => setLoadingData(false));
        }
    }, [id, t]);

    const handleAddField = () => {
        setCollection(prevState => ({
            ...prevState,
            additionalFields: [
                ...prevState.additionalFields,
                {name: '', type: 'string'}
            ]
        }));
    };

    const handleRemoveField = (index) => {
        setCollection(prevState => ({
            ...prevState,
            additionalFields: prevState.additionalFields.filter((_, i) => i !== index)
        }));
    };

    const handleFieldChange = (index, e) => {
        const {name, value} = e.target;
        setCollection(prevState => ({
            ...prevState,
            additionalFields: prevState.additionalFields.map((field, i) => (
                i === index ? {...field, [name]: value} : field
            ))
        }));
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setImage(selectedImage);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoadingSubmit(true);

        const fields = collection.additionalFields.reduce((acc, field) => {
            acc[field.name] = field.type;
            return acc;
        }, {});

        const data = {
            name: collection.name,
            description: collection.description,
            category: collection.category,
            fields,
            user_id: user.user_id,
            user_name: user.username,
            user: user.id,
        };

        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (image) {
            formData.append('files.image_url', image);
        }

        try {
            const request = id === 'new'
                ? api.post('/collections', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                : api.put(`/collections/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

            await request;
            setError(null);
            navigate('/collections');
        } catch (error) {
            console.error(error);
            setError(t("error_saving_data"));
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (loadingData) {
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

    return (
        <Container>
            <h1 className='mt-5 mb-4 text-center'>{id === 'new' ? t("create_a_collection") : t("edit_collection")}</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>{t("name")}:</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={collection.name}
                        onChange={e => setCollection({...collection, name: e.target.value})}
                        disabled={loadingSubmit}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>{t("description")}</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        value={collection.description}
                        onChange={e => setCollection({...collection, description: e.target.value})}
                        style={{resize: "none"}}
                        disabled={loadingSubmit}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>{t("category")}:</Form.Label>
                    <Form.Control
                        as="select"
                        name="category"
                        value={collection.category}
                        onChange={e => setCollection({...collection, category: e.target.value})}
                        disabled={loadingSubmit}
                    >
                        <option value="Books">{t("books")}</option>
                        <option value="Music">{t("music")}</option>
                        <option value="Movies">{t("movies")}</option>
                        <option value="Series">{t("series")}</option>
                        <option value="Silverware">{t("silverware")}</option>
                        <option value="Recipes">{t("recipes")}</option>
                        <option value="Coins">{t("coins")}</option>
                        <option value="Signs">{t("signs")}</option>
                        <option value="Other">{t("other")}</option>
                    </Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label>{t("image")}:</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loadingSubmit}
                    />
                    {collection.image_url && <img src={collection.image_url} alt={t("uploaded")}/>}
                </Form.Group>
                <h2 className='mt-4 mb-4'>{t("additional_fields")}</h2>
                {collection.additionalFields.map((field, index) => (
                    <div key={index} className="d-flex justify-content-center align-items-end">
                        <div className="col-md-4">
                            <Form.Group style={{marginRight: '20px'}}>
                                <Form.Label>{t("field_name")}:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={field.name}
                                    onChange={e => handleFieldChange(index, e)}
                                    style={{width: "100%"}}
                                    disabled={loadingSubmit}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Form.Group style={{marginRight: '20px'}}>
                                <Form.Label>{t("type")}:</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="type"
                                    value={field.type}
                                    onChange={e => handleFieldChange(index, e)}
                                    style={{width: "100%"}}
                                    disabled={loadingSubmit}
                                >
                                    <option value="string">{t("string")}</option>
                                    <option value="number">{t("number")}</option>
                                    <option value="text">{t("multiline_text")}</option>
                                    <option value="boolean">{t("yes_no")}</option>
                                    <option value="date">{t("date")}</option>
                                </Form.Control>
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Button variant="danger" className='w-100' onClick={() => handleRemoveField(index)}
                                    disabled={loadingSubmit}>
                                {t("delete_field")}
                            </Button>
                        </div>
                    </div>
                ))}
                <div className='text-center mt-4'>
                    <Button variant="warning" className='w-25' onClick={handleAddField} disabled={loadingSubmit}>
                        {t("add_a_field")}
                    </Button>
                </div>
                <div className='mt-5 mb-4 text-center'>
                    <Button type="submit" className='w-100 btn-secondary' disabled={loadingSubmit}>
                        {loadingSubmit ? t("sending") : t("save")}
                    </Button>

                </div>
            </Form>
        </Container>
    );
};

export default EditCollection;

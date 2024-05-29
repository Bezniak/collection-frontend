import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from "../../context/AuthContext";
import {Alert, Button, Form, Image, InputGroup} from 'react-bootstrap';
import api from "../utils/api";
import Container from "react-bootstrap/Container";
import './EditItem.css';
import {useTranslation} from "react-i18next";
import Preloader from "../Preloader/Preloader";
import DatePicker, {registerLocale} from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {enUS, pl} from 'date-fns/locale';

// Register the locales
registerLocale('en-US', enUS);
registerLocale('pl', pl);

const EditItem = () => {
    const {t, i18n} = useTranslation();
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {user, theme} = useAuth();
    const userName = user ? user.username : '';
    const userId = user ? user.user_id : '';
    const collectionId = new URLSearchParams(location.search).get('collection');
    const [collection, setCollection] = useState(null);
    const [allTags, setAllTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [image, setImage] = useState(null);
    const [item, setItem] = useState({
        name: '',
        tags: '',
        additionalFields: {},
        image_url: null,
        user_name: userName,
        user_id: userId,
        collection: collectionId,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (id !== 'new') {
                    const itemResponse = await api.get(`/items/${id}?populate=*`);
                    const itemData = itemResponse.data.attributes;
                    setItem({
                        name: itemData.name || '',
                        tags: itemData.tags || '',
                        additionalFields: itemData.additionalFields || {},
                        image_url: itemData.image_url || null,
                        user_name: itemData.user_name || userName,
                        user_id: itemData.user_id || userId,
                        collection: itemData.collection || collectionId,
                        user: itemData.id || ''
                    });
                }

                if (collectionId) {
                    const collectionResponse = await api.get(`/collections/${collectionId}?populate=*`);
                    setCollection(collectionResponse.data);
                }

                const tagsResponse = await api.get('/tags');
                const tags = tagsResponse.data.map(tag => tag.attributes.tags);
                setAllTags(tags);
            } catch (error) {
                setError('Error fetching data');
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, collectionId]);

    const handleTagInputChange = (e) => {
        const inputValue = e.target.value;
        setItem({...item, tags: inputValue});

        if (inputValue.trim() === '') {
            setSuggestions([]);
            return;
        }

        const inputTags = inputValue.split(',').map(tag => tag.trim());
        const currentTag = inputTags[inputTags.length - 1].toLowerCase();

        const filteredSuggestions = allTags
            .filter(tag => !inputTags.includes(tag) && tag?.toLowerCase().startsWith(currentTag))
            .map(tag => ({tag, selected: false}));

        setSuggestions(filteredSuggestions);
    };

    const handleTagClick = (clickedTag) => {
        const inputTags = item.tags.split(',').map(tag => tag.trim());
        inputTags[inputTags.length - 1] = clickedTag;  // Replace the last tag with the clicked suggestion
        setItem({...item, tags: inputTags.join(', ') + ', '});
        setSuggestions([]);  // Clear suggestions
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setImage(selectedImage);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Split tags by spaces and commas, trim whitespace, and filter out empty tags
        const inputTags = item.tags.split(/[\s,]+/).map(tag => tag.trim()).filter(tag => tag !== '');
        const existingTags = [];
        const newTags = [];

        inputTags.forEach(tag => {
            if (allTags.includes(tag)) {
                existingTags.push(tag);
            } else {
                newTags.push(tag);
            }
        });

        const data = {
            name: item.name,
            tags: inputTags.join(', '),  // Join tags back into a string separated by commas
            user_name: user.username,
            user_id: user.user_id,
            collection: collectionId,
            user: user.id,
            additionalFields: item.additionalFields,
        };

        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (image) {
            formData.append('files.image_url', image);
        }

        try {
            for (const tag of newTags) {
                await api.post('/tags', {data: {tags: tag}});
            }

            const request = id === 'new'
                ? api.post('/items', formData)
                : api.put(`/items/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

            await request;
            navigate(`/collection/${collectionId || item.collection.id}`);
        } catch (error) {
            setError('Error saving item');
            console.error('Error saving item:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInputType = (type) => {
        switch (type) {
            case 'string':
                return 'text';
            case 'number':
                return 'number';
            case 'date':
                return 'date';
            case 'boolean':
                return 'checkbox';
            default:
                return 'text';
        }
    };


    const handleFieldChange = (e) => {
        const {name, value, type, checked} = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setItem({
            ...item,
            additionalFields: {
                ...item.additionalFields,
                [name]: fieldValue,
            },
        });
    };

    const handleDateChange = (key, date) => {
        // Convert date to ISO string and slice to get only the date part
        const dateString = date.toISOString().split('T')[0];
        setItem({
            ...item,
            additionalFields: {
                ...item.additionalFields,
                [key]: dateString,
            },
        });
    };

    const renderField = (key, type) => {
        if (type === 'text') {
            return (
                <Form.Control
                    as="textarea"
                    style={{resize: "none", height: '200px'}}
                    name={key}
                    value={item.additionalFields[key] || ''}
                    onChange={handleFieldChange}
                    className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                />
            );
        }

        if (type === 'boolean') {
            return (
                <div className='d-flex gap-3'>
                    <Form.Check
                        type="checkbox"
                        name={key}
                        checked={item.additionalFields[key] || false}
                        onChange={handleFieldChange}
                        label={t("yes")}
                        className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                    />
                    <Form.Check
                        type="checkbox"
                        name={key}
                        checked={!item.additionalFields[key]}
                        onChange={handleFieldChange}
                        label={t("no")}
                        className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                    />
                </div>
            );
        }

        if (type === 'date') {
            return (
                <div className="mb-3">
                    <DatePicker
                        selected={item.additionalFields[key] ? new Date(item.additionalFields[key]) : null}
                        onChange={date => handleDateChange(key, date)}
                        className={`form-control ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                        dateFormat="dd-MM-yyyy"
                        locale={i18n.language === 'pl' ? 'pl' : 'en-US'}
                        showWeekNumbers
                        weekStart={1}
                    />
                </div>
            );
        }

        return (
            <Form.Control
                type={getInputType(type)}
                name={key}
                value={item.additionalFields[key] || ''}
                onChange={handleFieldChange}
                className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
            />
        );
    };

    if (loading) {
        return <Preloader/>;
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <Alert variant="danger"
                       className="text-center d-flex flex-column justify-content-center align-items-center">
                    Error: {error.message}
                </Alert>
            </div>
        );
    }

    return (
        <Container className='mt-5 mb-5'>
            <Form onSubmit={handleSubmit}>
                <div>
                    <h1 className='mt-5 mb-5 text-center'>{id === 'new' ? t("create_item") : t("edit_item")}</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group controlId="itemName">
                        <Form.Label>{t("name")}:</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={item.name}
                            onChange={e => setItem({...item, name: e.target.value})}
                            className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                        />
                    </Form.Group>
                    <Form.Group controlId="itemTags">
                        <Form.Label>{t("tags")}:</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                name="tags"
                                value={item.tags}
                                onChange={handleTagInputChange}
                                onBlur={() => setSuggestions([])}
                                className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                            />
                            {suggestions.length > 0 && (
                                <div
                                    className={`suggestions ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}>
                                    {suggestions.map((suggestion, index) => (
                                        <div key={index} className="suggestion-item"
                                             onMouseDown={() => handleTagClick(suggestion.tag)}>
                                            {suggestion.tag}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="itemImage">
                        <Form.Label>{t("image")}:</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                        />
                        {item.image_url && <Image src={item.image_url} alt={t("uploaded")} thumbnail/>}
                    </Form.Group>
                    {collection && collection.attributes.fields && Object.keys(collection.attributes.fields).map(key => (
                        <Form.Group key={key} controlId={`itemField_${key}`}>
                            <Form.Label>{key}:</Form.Label>
                            {renderField(key, collection.attributes.fields[key])}
                        </Form.Group>
                    ))}
                    <div className="text-center">
                        <Button variant="primary" type="submit" className='mt-5 w-25' disabled={isSubmitting}>
                            {isSubmitting ? t("sending") : t("save")}
                        </Button>
                    </div>
                </div>
            </Form>
        </Container>
    );
};

export default EditItem;

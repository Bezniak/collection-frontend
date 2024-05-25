import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from "../../context/AuthContext";
import {Button, Form, InputGroup, Image} from 'react-bootstrap';
import api from "../utils/api";
import Container from "react-bootstrap/Container";

const EditItem = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {user} = useAuth();
    const userName = user ? user.username : '';
    const userId = user ? user.user_id : '';


    const collectionId = new URLSearchParams(location.search).get('collection');

    const [item, setItem] = useState({
        name: '',
        tags: '',
        additionalFields: {},
        image_url: null,
        user_name: userName,
        user_id: userId,
        collection: collectionId
    });
    const [collection, setCollection] = useState(null);
    const [allTags, setAllTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [image, setImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
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
                        collection: itemData.collection || collectionId
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
                console.error('Error fetching data:', error);
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
            .filter(tag => !inputTags.includes(tag) && tag.toLowerCase().startsWith(currentTag))
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

        const inputTags = item.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const existingTags = [];
        const newTags = [];

        inputTags.forEach(tag => {
            if (allTags.includes(tag)) {
                existingTags.push(tag);
            } else {
                newTags.push(tag);
            }
        });

        const formData = new FormData();
        formData.append('data', JSON.stringify(item));
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
            console.error('Error saving item:', error);
        }
    };

    const handleFieldChange = (e) => {
        const {name, value, type, checked} = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;
        setItem({
            ...item,
            additionalFields: {
                ...item.additionalFields,
                [name]: fieldValue
            }
        });
    };

    const renderField = (key, type) => {
        if (type === 'text') {
            return (
                <Form.Control
                    as="textarea"
                    style={{resize: "none"}}
                    name={key}
                    value={item.additionalFields[key] || ''}
                    onChange={handleFieldChange}
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
                        label="Да"
                    />
                    <Form.Check
                        type="checkbox"
                        name={key}
                        checked={!item.additionalFields[key]}
                        onChange={handleFieldChange}
                        label="Нет"
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
            />
        );
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

    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <div>
                    <h1 className='mt-5 mb-5 text-center'>{id === 'new' ? 'Создать айтем' : 'Редактировать айтем'}</h1>
                    <Form.Group controlId="itemName">
                        <Form.Label>Название:</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={item.name}
                            onChange={e => setItem({...item, name: e.target.value})}
                        />
                    </Form.Group>
                    <Form.Group controlId="itemTags">
                        <Form.Label>Тэги:</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                name="tags"
                                value={item.tags}
                                onChange={handleTagInputChange}
                                onBlur={() => setSuggestions([])}
                            />
                            {suggestions.length > 0 && (
                                <div className="suggestions">
                                    {suggestions.map((suggestion, index) => (
                                        <div key={index} onMouseDown={() => handleTagClick(suggestion.tag)}>
                                            {suggestion.tag}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="itemImage">
                        <Form.Label>Изображение:</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {item.image_url && <Image src={item.image_url} alt="Uploaded" thumbnail/>}
                    </Form.Group>
                    {collection && collection.attributes.fields && Object.keys(collection.attributes.fields).map(key => (
                        <Form.Group key={key} controlId={`itemField_${key}`}>
                            <Form.Label>{key}:</Form.Label>
                            {renderField(key, collection.attributes.fields[key])}
                        </Form.Group>
                    ))}
                    <div className="text-center">
                        <Button variant="primary" type="submit" className='mt-5 w-75'>
                            Сохранить
                        </Button>
                    </div>
                </div>
            </Form>
        </Container>
    );
};

export default EditItem;
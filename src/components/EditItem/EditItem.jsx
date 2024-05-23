import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {useAuth} from "../../context/AuthContext";
import api from "../utils/api";

const EditItem = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {user} = useAuth();
    const collectionId = new URLSearchParams(location.search).get('collection');

    const [item, setItem] = useState({
        name: '',
        tags: '',
        additionalFields: {},
        image_url: null,
        user_name: user.username,
        user_id: user.user_id,
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
                        user_name: itemData.user_name || user.username,
                        user_id: itemData.user_id || user.user_id,
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
                <textarea
                    name={key}
                    value={item.additionalFields[key] || ''}
                    onChange={handleFieldChange}
                />
            );
        }

        if (type === 'boolean') {
            return (
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name={key}
                            checked={item.additionalFields[key] || false}
                            onChange={handleFieldChange}
                        />
                        Да
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            name={key}
                            checked={!item.additionalFields[key]}
                            onChange={handleFieldChange}
                        />
                        Нет
                    </label>
                </div>
            );
        }

        return (
            <input
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
        <form onSubmit={handleSubmit}>
            <div>
                <h1>{id === 'new' ? 'Создать айтем' : 'Редактировать айтем'}</h1>
                <label>
                    Название:
                    <input type="text"
                           name="name"
                           value={item.name}
                           onChange={e => setItem({...item, name: e.target.value})}
                    />
                </label>
                <label>
                    Тэги:
                    <input
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
                </label>
                <label>
                    Изображение:
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {item.image_url && <img src={item.image_url} alt="Uploaded"/>}
                </label>
                {collection && collection.attributes.fields && Object.keys(collection.attributes.fields).map(key => (
                    <label key={key}>
                        {key}:{renderField(key, collection.attributes.fields[key])}
                    </label>
                ))}
                <button type="submit">Сохранить</button>
            </div>
        </form>
    );
};

export default EditItem;


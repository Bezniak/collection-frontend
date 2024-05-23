import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "../utils/api";
import { useAuth } from "../../context/AuthContext";

const EditCollection = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [collection, setCollection] = useState({
        name: '',
        description: '',
        category: 'Other',
        image_url: null,
        fields: {},
        additionalFields: []
    });

    const [image, setImage] = useState(null);

    useEffect(() => {
        if (id !== 'new') {
            api.get(`/collections/${id}?populate=*`)
                .then(response => {
                    if (response.data && response.data.attributes) {
                        const data = response.data.attributes;
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
                    } else {
                        console.error("Response structure is incorrect", response);
                    }
                })
                .catch(error => console.error(error));
        }
    }, [id]);

    const handleAddField = () => {
        setCollection(prevState => ({
            ...prevState,
            additionalFields: [
                ...prevState.additionalFields,
                { name: '', type: 'string' }
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
        const { name, value } = e.target;
        setCollection(prevState => ({
            ...prevState,
            additionalFields: prevState.additionalFields.map((field, i) => (
                i === index ? { ...field, [name]: value } : field
            ))
        }));
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        setImage(selectedImage);
    };

    const handleSubmit = async e => {
        e.preventDefault();

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
            navigate('/collections');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>{id === 'new' ? 'Создать коллекцию' : 'Редактировать коллекцию'}</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Название:
                    <input
                        type="text"
                        name="name"
                        value={collection.name}
                        onChange={e => setCollection({ ...collection, name: e.target.value })}
                    />
                </label>
                <label>
                    Описание:
                    <textarea
                        name="description"
                        value={collection.description}
                        onChange={e => setCollection({ ...collection, description: e.target.value })}
                    />
                </label>
                <label>
                    Категория:
                    <select
                        name="category"
                        value={collection.category}
                        onChange={e => setCollection({ ...collection, category: e.target.value })}
                    >
                        <option value="Books">Books</option>
                        <option value="Signs">Signs</option>
                        <option value="Silverware">Silverware</option>
                        <option value="Music">Music</option>
                        <option value="Movies">Movies</option>
                        <option value="Series">Series</option>
                        <option value="Recipes">Recipes</option>
                        <option value="Coins">Coins</option>
                        <option value="Other">Other</option>
                    </select>
                </label>
                <label>
                    Изображение:
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {collection.image_url && <img src={collection.image_url} alt="Uploaded" />}
                </label>
                <h2>Дополнительные поля</h2>
                {collection.additionalFields.map((field, index) => (
                    <div key={index}>
                        <label>
                            Название поля:
                            <input
                                type="text"
                                name="name"
                                value={field.name}
                                onChange={e => handleFieldChange(index, e)}
                            />
                        </label>
                        <label>
                            Тип:
                            <select
                                name="type"
                                value={field.type}
                                onChange={e => handleFieldChange(index, e)}
                            >
                                <option value="string">Строка</option>
                                <option value="number">Число</option>
                                <option value="text">Многострочный текст</option>
                                <option value="boolean">Да/нет</option>
                                <option value="date">Дата</option>
                            </select>
                        </label>
                        <button type="button" onClick={() => handleRemoveField(index)}>Удалить поле</button>
                    </div>
                ))}
                <button type="button" onClick={handleAddField}>Добавить поле</button>
                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default EditCollection;

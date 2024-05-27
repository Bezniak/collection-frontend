import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Button, Container, Form} from 'react-bootstrap';
import api from "../utils/api";
import {useAuth} from "../../context/AuthContext";

const EditCollection = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();

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
            navigate('/collections');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Container>
            <h1 className='mt-5 mb-4 text-center'>{id === 'new' ? 'Создать коллекцию' : 'Редактировать коллекцию'}</h1>
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Название:</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        value={collection.name}
                        onChange={e => setCollection({...collection, name: e.target.value})}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Описание:</Form.Label>
                    <Form.Control
                        as="textarea"
                        name="description"
                        value={collection.description}
                        onChange={e => setCollection({...collection, description: e.target.value})}
                        style={{resize: "none"}}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Категория:</Form.Label>
                    <Form.Control
                        as="select"
                        name="category"
                        value={collection.category}
                        onChange={e => setCollection({...collection, category: e.target.value})}
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
                    </Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Изображение:</Form.Label>
                    <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {collection.image_url && <img src={collection.image_url} alt="Uploaded"/>}
                </Form.Group>
                <h2 className='mt-4 mb-4'>Дополнительные поля</h2>
                {collection.additionalFields.map((field, index) => (
                    <div key={index} className="d-flex justify-content-center align-items-end">
                        <div className="col-md-4">
                            <Form.Group style={{marginRight: '20px'}}>
                                <Form.Label>Название поля:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={field.name}
                                    onChange={e => handleFieldChange(index, e)}
                                    style={{width: "100%"}}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Form.Group style={{marginRight: '20px'}}>
                                <Form.Label>Тип:</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="type"
                                    value={field.type}
                                    onChange={e => handleFieldChange(index, e)}
                                    style={{width: "100%"}}
                                >
                                    <option value="string">Строка</option>
                                    <option value="number">Число</option>
                                    <option value="text">Многострочный текст</option>
                                    <option value="boolean">Да/нет</option>
                                    <option value="date">Дата</option>
                                </Form.Control>
                            </Form.Group>
                        </div>
                        <div className="col-md-4">
                            <Button variant="danger" className='w-100' onClick={() => handleRemoveField(index)}>Удалить
                                поле</Button>
                        </div>
                    </div>
                ))}
                <div className='text-center mt-4'>
                    <Button variant="warning" className='w-25' onClick={handleAddField}>Добавить поле</Button>
                </div>
                <div className='mt-4 mb-4'>
                    <Button type="submit" className='w-100 btn-secondary'>Сохранить</Button>
                </div>
            </Form>
        </Container>
    );
};

export default EditCollection;
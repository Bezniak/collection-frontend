import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Card } from 'react-bootstrap';
import './Home.css'; // Assuming you create a CSS file for additional styles

const Home = () => {
    const [popularTags, setPopularTags] = useState([]);
    const [latestItems, setLatestItems] = useState([]);
    const [largestCollections, setLargestCollections] = useState([]);

    console.log('latestItems', latestItems)

    useEffect(() => {
        const fetchPopularTags = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/items?populate=*`);

                const tagSet = new Set();
                const uniqueTagsWithIds = [];

                response.data.data.forEach(item => {
                    if (item.attributes.tags) {
                        item.attributes.tags.split(',').forEach(tag => {
                            const trimmedTag = tag.trim();
                            if (!tagSet.has(trimmedTag)) {
                                tagSet.add(trimmedTag);
                                uniqueTagsWithIds.push({
                                    tag: trimmedTag,
                                    id: item.id
                                });
                            }
                        });
                    }
                });

                // Limit to 50 unique tags
                setPopularTags(uniqueTagsWithIds.slice(0, 50));
            } catch (error) {
                console.error('Error fetching popular tags:', error);
            }
        };

        const fetchLatestItems = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/items?sort=createdAt:desc&populate=*`);
                console.log(response.data.data)

                const items = response.data.data.map(item => {
                    const collectionName = item.attributes.collection?.data?.attributes?.name || 'Без коллекции';
                    return {
                        name: item.attributes.name,
                        collection: collectionName,
                        author: item.attributes.user?.data?.attributes?.username || 'Unknown',
                        id: item.id
                    };
                });

                setLatestItems(items);
            } catch (error) {
                console.error('Error fetching latest items:', error);
            }
        };


        const fetchLargestCollections = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/collections?populate=*`);
                const collections = response.data.data.map(collection => ({
                    id: collection.id,
                    name: collection.attributes.name,
                    itemCount: collection.attributes.items?.data?.length || 0
                }));

                collections.sort((a, b) => b.itemCount - a.itemCount);

                setLargestCollections(collections.slice(0, 5));
            } catch (error) {
                console.error('Error fetching largest collections:', error);
            }
        };

        fetchPopularTags();
        fetchLatestItems();
        fetchLargestCollections();
    }, []);

    return (
        <Container className='mt-5 mb-5'>
            <h1 className="my-4">Самые популярные теги:</h1>
            {popularTags.length > 0 && (
                <ListGroup className="tag-list">
                    {popularTags.map((tagObj, index) => (
                        <ListGroup.Item key={index} className="tag-item text-center">
                            <Link to={`/item/${tagObj.id}`} className='text-decoration-none '>{tagObj.tag}</Link>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}


            <h1 className="my-4">Последние добавленные айтемы:</h1>
            {latestItems.length > 0 && (
                <Row>
                    {latestItems.map((item, index) => (
                        <Col md={6} lg={4} key={index} className="mb-4">
                            <Card className="item-card h-100">
                                <Card.Body>
                                    <Card.Title>
                                        <Link to={`/item/${item.id}`}>{item.name}</Link>
                                    </Card.Title>
                                    <Card.Text>
                                        Коллекция: {item.collection}, Автор: {item.author}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <h1 className="my-4">5 самых больших коллекций:</h1>
            {largestCollections.length > 0 && (
                <ListGroup className="w-25">
                    {largestCollections.map((collection, index) => (
                        <ListGroup.Item key={index} className="collection-item">
                            <Link to={`/collection/${collection.id}`}>{collection.name}</Link>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Container>
    );
};

export default Home;

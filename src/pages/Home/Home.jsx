import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {Alert, Card, Col, Container, ListGroup, Row} from 'react-bootstrap';
import './Home.css';
import {useTranslation} from "react-i18next";
import Preloader from "../../components/Preloader/Preloader";
import {useAuth} from "../../context/AuthContext";

const Home = () => {
    const {t} = useTranslation();
    const [popularTags, setPopularTags] = useState([]);
    const [latestItems, setLatestItems] = useState([]);
    const [largestCollections, setLargestCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {theme} = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const popularTagsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/items?populate=*`);
                const latestItemsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/items?sort=createdAt:desc&populate=*`);
                const largestCollectionsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/collections?populate=*`);

                const popularTagsData = processTags(popularTagsResponse.data.data);
                const latestItemsData = processLatestItems(latestItemsResponse.data.data);
                const largestCollectionsData = processCollections(largestCollectionsResponse.data.data);

                setPopularTags(popularTagsData);
                setLatestItems(latestItemsData);
                setLargestCollections(largestCollectionsData);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const processTags = (data) => {
        const tagSet = new Set();
        const uniqueTagsWithIds = [];
        data.forEach(item => {
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
        return uniqueTagsWithIds.slice(0, 50);
    };

    const processLatestItems = (data) => {
        return data.map(item => {
            const collectionName = item.attributes.collection?.data?.attributes?.name || `${t("no_collection")}`;
            return {
                name: item.attributes.name,
                collection: collectionName,
                author: item.attributes.user?.data?.attributes?.username || `${t("unknown")}`,
                id: item.id
            };
        });
    };

    const processCollections = (data) => {
        const collections = data.map(collection => ({
            id: collection.id,
            name: collection.attributes.name,
            itemCount: collection.attributes.items?.data?.length || 0
        }));
        collections.sort((a, b) => b.itemCount - a.itemCount);
        return collections.slice(0, 5);
    };

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

    return (
        <Container className='mt-5 mb-5 d-flex flex-column justify-content-between gap-5'>
            <div>
                <h1 className="my-4">{t("most_popular_tags")}</h1>
                {popularTags.length > 0 && (
                    <ListGroup className="tag-list ">
                        {popularTags.map((tagObj, index) => (
                            <ListGroup.Item key={index}
                                            className={`hover tag-item text-center ${theme === "light" ? "bg-light text-dark" : "bg-dark text-light"}`}
                            >
                                <Link to={`/item/${tagObj.id}`}
                                      className={`text-decoration-none ${theme === "light" ? "text-dark" : "text-light"}`}
                                >
                                    {tagObj.tag}
                                </Link>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </div>


            <div>
                <h1 className="my-4">{t("latest_added_items")}</h1>
                {latestItems.length > 0 && (
                    <Row>
                        {latestItems.map((item, index) => (
                            <Col md={6} lg={4} key={index} className="mb-4">
                                <Card
                                    className={` item-card h-100 ${theme === "light" ? "bg-light" : "bg-dark border-light"}`}>
                                    <Card.Body
                                        className=' d-flex flex-column align-items-center justify-content-between'>
                                        <Card.Title className='text-center'>
                                            <Link to={`/item/${item.id}`}
                                                  className={`text-decoration-none ${theme === 'light' ? 'text-dark' : 'text-light'}`}>{item.name}</Link>
                                        </Card.Title>
                                        <Card.Text className={`${theme === 'light' ? 'text-dark' : 'text-light'}`}>
                                            {t("collection")}: {item.collection}, {t("author")}: {item.author}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>

            <div>
                <h1 className="my-4">{t("5_largest_collections")}</h1>
                {largestCollections.length > 0 && (
                    <ListGroup className="w-25">
                        {largestCollections.map((collection, index) => (
                            <ListGroup.Item key={index}
                                            className={`hover collection-item text-center ${theme === 'light' ? 'bg-light' : 'bg-dark'}`}>
                                <Link to={`/collection/${collection.id}`}
                                      className={`text-decoration-none ${theme === 'light' ? 'text-dark' : 'text-light'}`}
                                >
                                    {collection.name}
                                </Link>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </div>
        </Container>
    );
};

export default Home;

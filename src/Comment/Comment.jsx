import React, { useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../components/utils/api";
import { formatDate } from "../components/utils/formatDate";
import Preloader from "../components/Preloader/Preloader";

const Comment = ({ itemId }) => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { user } = useAuth();

    console.log(comments)

    const getAllComments = async () => {
        try {
            const response = await api.get(`/comments?filters[item][id][$eq]=${itemId}&&populate=user`);
            setComments(response.data || []);
            setLoading(false);
        } catch (error) {
            setError(true);
            setLoading(false);
            console.error('Error fetching comments:', error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        getAllComments();
    }, [itemId]);

    const onSubmit = async () => {
        if (!user) {
            toast.error('You must be logged in to send comment');
            return;
        }

        try {
            const response = await api.post('/comments', {
                data: {
                    text: comment,
                    user: user.id,
                    item: itemId,
                },
            });

            // Add the new comment to the comments array
            const newComment = {
                id: response.data.id,
                attributes: {
                    text: comment,
                    user: {
                        data: {
                            attributes: {
                                username: user.username,
                            },
                        },
                    },
                    publishedAt: new Date().toISOString(),
                },
            };

            setComments([...comments, newComment]);
            setComment('');
        } catch (error) {
            console.error('Error adding comment:', error.response ? error.response.data : error.message);
            console.log(error);
        }
    };

    if (loading) {
        return <Preloader />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <Container>
            <Row className="mt-4">
                <Col>
                    <FloatingLabel controlId="floatingTextarea2" label="Leave a comment here">
                        <Form.Control
                            as="textarea"
                            placeholder="Leave a comment here"
                            style={{ height: '150px', resize: "none" }}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                    </FloatingLabel>
                </Col>
            </Row>
            <Row className="mt-2">
                <Col>
                    <Button variant="success" className='w-100' onClick={onSubmit}>Отправить</Button>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    {!loading && !error && comments.length === 0 && <p>No comments yet.</p>}
                    {!loading && !error && comments.map((comment) => (
                        <div key={comment.id} className="border p-3 mt-3">
                            <div>
                                <h2>{comment.attributes.user.data.attributes.username}</h2>
                                <p>{formatDate(comment.attributes.publishedAt)}</p>
                            </div>
                            <div>
                                <p>{comment.attributes.text}</p>
                            </div>
                        </div>
                    ))}
                </Col>
            </Row>
        </Container>
    );
};

export default Comment;

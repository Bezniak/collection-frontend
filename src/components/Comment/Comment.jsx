import React, {useEffect, useState} from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {Alert, Button, Card, Col, Container, Form, Row} from 'react-bootstrap';
import {useAuth} from '../../context/AuthContext';
import {toast} from 'react-toastify';
import api from '../utils/api';
import {formatDate} from '../utils/formatDate';
import Preloader from '../Preloader/Preloader';
import {NavLink} from 'react-router-dom';
import {useTranslation} from "react-i18next";

const Comment = ({itemId}) => {
    const {t} = useTranslation();
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const {user, role} = useAuth();

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
            toast.error(`${t("comment_rule")}`);
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
            // Requesting an updated list of comments from the server
            getAllComments();
        } catch (error) {
            console.error('Error adding comment:', error.response ? error.response.data : error.message);
            console.log(error);
        }
    };

    const onDelete = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`);
            setComments(comments.filter((comment) => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error.response ? error.response.data : error.message);
        }
    };

    const onEdit = async (commentId, newText) => {
        try {
            await api.put(`/comments/${commentId}`, {data: {text: newText}});
            setComments(
                comments.map((comment) =>
                    comment.id === commentId ? {
                        ...comment,
                        attributes: {...comment.attributes, text: newText}
                    } : comment
                )
            );
            setEditingCommentId(null);
        } catch (error) {
            console.error('Error editing comment:', error.response ? error.response.data : error.message);
        }
    };

    if (loading) {
        return <Preloader/>;
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
            {user ? (
                <>
                    <Row className="mt-4">
                        <Col>
                            <FloatingLabel controlId="floatingTextarea2" label={`${t("comment_label")}`}>
                                <Form.Control
                                    as="textarea"
                                    placeholder={`${t("comment_label")}`}
                                    style={{height: '150px', resize: 'none'}}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </FloatingLabel>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col>
                            <Button variant="success" className="w-100" onClick={onSubmit}>
                                {t("send")}
                            </Button>
                        </Col>
                    </Row>
                </>
            ) : (
                <Container>
                    <Row className="justify-content-end">
                        <Col>
                            <h5 className="text-end">
                                {t("you_must_be")}&nbsp;
                                <NavLink to="/login">{t("logged_in")}</NavLink>&nbsp;{t("to_send_a_comment")}
                            </h5>
                        </Col>
                    </Row>
                </Container>
            )}
            <Row className="mt-4">
                <Col>
                    {!loading && !error && comments.length === 0 && <p>{t("no_comments_yet")}</p>}
                    {!loading &&
                        !error &&
                        comments.map((comment) => (
                            <Card key={comment.id} className="border p-2 mt-2">
                                <Card.Body>
                                    <Card.Title>{comment.attributes.user.data.attributes.username}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">
                                        {formatDate(comment.attributes.publishedAt)}
                                    </Card.Subtitle>
                                    {editingCommentId === comment.id ? (
                                        <>
                                            <Form.Control
                                                as="textarea"
                                                value={comment.attributes.text}
                                                onChange={(e) =>
                                                    setComments(
                                                        comments.map((c) =>
                                                            c.id === comment.id
                                                                ? {
                                                                    ...c,
                                                                    attributes: {
                                                                        ...c.attributes,
                                                                        text: e.target.value,
                                                                    },
                                                                }
                                                                : c
                                                        )
                                                    )
                                                }
                                            />
                                            <Button
                                                variant="success"
                                                className="mt-2"
                                                onClick={() => onEdit(comment.id, comment.attributes.text)}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="danger"
                                                className="mt-2 ms-2"
                                                onClick={() => setEditingCommentId(null)}
                                            >
                                                {t("cancel")}
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Card.Text>{comment.attributes.text}</Card.Text>
                                            {(user && user.id === comment.attributes.user.data.id || role === 'admin') && (
                                                <>
                                                    <Button
                                                        variant="primary"
                                                        className="me-2"
                                                        onClick={() => setEditingCommentId(comment.id)}
                                                    >
                                                        {t("edit")}
                                                    </Button>
                                                    <Button variant="danger" onClick={() => onDelete(comment.id)}>
                                                        {t("delete")}
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        ))}
                </Col>
            </Row>
        </Container>
    );
};

export default Comment;

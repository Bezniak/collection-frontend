import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useAuth} from "../../context/AuthContext";
import api from "../utils/api";
import {Alert, Button, Container, Form} from 'react-bootstrap';
import Preloader from "../Preloader/Preloader";
import {useTranslation} from "react-i18next";

const TicketForm = () => {
    const {t} = useTranslation();
    const {user, theme} = useAuth();
    const [summary, setSummary] = useState('');
    const [priority, setPriority] = useState('Low');
    const [issueUrl, setIssueUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const currentPage = window.location.href;
    const [currentCollection, setCurrentCollection] = useState('');
    const [collections, setCollections] = useState([]);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true)
                let collectionsResponse = await api.get(`/collections?populate=*`);
                if (collectionsResponse?.data) {
                    setCollections(collectionsResponse.data);
                } else {
                    setCollections([]);
                }
            } catch (error) {
                setLoading(false)
                setError(error);
            } finally {
                setLoading(false)
            }
        };

        fetchCollections();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!summary || !currentCollection) {
            setFormError(t("please_fill_in_all_fields"));
            return;
        }
        const requestBody = {
            summary,
            priority,
            link: currentPage,
            collection: currentCollection,
            user
        };
        try {
            setLoading(true);
            const response = await axios.post(process.env.REACT_APP_BACKEND_URL + '/create-ticket', requestBody);
            setIssueUrl(response.data.issueUrl);
            setError('');
        } catch (error) {
            console.error(`${t("error_creating_ticket")}`, error);
            setError(`${t("failed_to_create_ticket_try_again")}`);
        } finally {
            setLoading(false);
            setSummary('');
            setPriority('Low');
            setCurrentCollection('');
        }
    };

    if (loading) {
        return <Preloader/>
    }

    return (
        <Container className='mt-5'>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formCollection">
                    <Form.Label>{t("collection")}</Form.Label>
                    <Form.Control
                        as="select"
                        name="collection"
                        className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                        value={currentCollection}
                        onChange={(e) => setCurrentCollection(e.target.value)}
                        required
                    >
                        <option value="">{t("select_a_collection")}</option>
                        {collections.map((collection) => (
                            <option key={collection.id} value={collection.attributes.name}>
                                {collection.attributes.name}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="formSummary">
                    <Form.Label>{t("summary")}</Form.Label>
                    <Form.Control
                        as="textarea"
                        value={summary}
                        style={{resize: "none", height: "150px"}}
                        className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                        onChange={(e) => setSummary(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group controlId="formPriority">
                    <Form.Label>{t("priority")}</Form.Label>
                    <Form.Control
                        as="select"
                        className={`mb-3 ${theme === 'light' ? 'bg-light text-dark' : 'bg-dark text-light'}`}
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="High">{t("high")}</option>
                        <option value="Medium">{t("medium")}</option>
                        <option value="Low">{t("low")}</option>
                    </Form.Control>
                </Form.Group>

                {formError && (
                    <Alert variant="danger" className="mb-3">
                        {formError}
                    </Alert>
                )}

                <div className='text-center mt-5 mb-5'>
                    <Button variant="primary" type="submit">
                        {t("create_ticket")}
                    </Button>
                </div>
            </Form>

            {issueUrl && (
                <Alert variant="success" className="mt-3">
                    {t("ticket_created_you_can_view_it")}{' '}
                    <Alert.Link href={issueUrl} target="_blank" rel="noopener noreferrer">
                        {t("here")}
                    </Alert.Link>.
                </Alert>
            )}

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Container>
    );
};

export default TicketForm;

import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {useAuth} from "../../context/AuthContext";
import {Container, Pagination, Table} from 'react-bootstrap';
import {useTranslation} from "react-i18next";
import Preloader from "../Preloader/Preloader";

const UserProfile = () => {
    const {t} = useTranslation();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const {user, theme} = useAuth();
    const ticketsPerPage = 10;
    const currentUserEmail = user?.email;

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND_URL + '/tickets', {
                    params: {
                        reportedBy: currentUserEmail,
                        startAt: (page - 1) * ticketsPerPage,
                        maxResults: ticketsPerPage
                    }
                });
                setTickets(response.data.issues);
                setTotalPages(Math.ceil(response.data.total / ticketsPerPage));
            } catch (error) {
                console.error(`${t("error_fetching_tickets")}:`, error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUserEmail) {
            fetchTickets();
        } else {
            setLoading(false);
        }
    }, [currentUserEmail, page]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (loading) {
        return <Preloader/>;
    }

    return (
        <Container fluid="md" className='mt-5 mb-5'>
            <h2 className="text-center mb-4 fs-2">{t("my_tickets")}</h2>
            {tickets.length === 0 ? (
                <p>{t("no_tickets_found")}</p>
            ) : (
                <>
                    <Table striped bordered hover responsive="md"
                           className={`table ${theme === 'light' ? 'table-light' : 'table-dark'}`}>
                        <thead className="bg-dark text-white">
                        <tr className='text-uppercase'>
                            <th>{t("id")}</th>
                            <th>{t("summary")}</th>
                            <th>{t("status")}</th>
                            <th>{t("priority")}</th>
                            <th>{t("collection")}</th>
                            <th>{t("jira_link")}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td>{ticket.id}</td>
                                <td>{ticket.fields.summary}</td>
                                <td>{ticket.fields.customfield_10044?.value}</td>
                                <td>{ticket.fields.priority?.name}</td>
                                <td>{ticket.fields.customfield_10035}</td>
                                <td>
                                    <a href={`https://ivan-bezniak97.atlassian.net/browse/${ticket.key}`}
                                       target="_blank" rel="noopener noreferrer">
                                        {ticket.key}
                                    </a>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <Pagination className={`justify-content-center mt-5 ${theme === 'light' ? 'bg-light' : 'bg-dark'}`}>
                        <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1}/>
                        {[...Array(totalPages).keys()].map(num => (
                            <Pagination.Item
                                key={num + 1}
                                active={num + 1 === page}
                                onClick={() => handlePageChange(num + 1)}
                            >
                                {num + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}/>
                    </Pagination>
                </>
            )}
        </Container>
    );
};

export default UserProfile;

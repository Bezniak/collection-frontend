import React, {useState} from 'react';
import axios from "axios";
import Preloader from "../Preloader/Preloader";
import {Alert, Table} from "react-bootstrap";
import {FaLock, FaLockOpen, FaUserLock} from "react-icons/fa";
import {RiDeleteBin6Line} from "react-icons/ri";
import {formatDate} from "../utils/formatDate";
import Cookies from "js-cookie";
import {GrUserAdmin} from "react-icons/gr";
import {useAuth} from "../../context/AuthContext";
import {NavLink} from "react-router-dom";
import Container from "react-bootstrap/Container";
import {useTranslation} from "react-i18next";
import useFetch from "../utils/useFetch";

const AdminPanel = () => {
    const {data, loading, error, refetch} = useFetch(`/users?populate=*`);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const {user, updateRole} = useAuth();
    const jwt = Cookies.get('JWT');
    const {t} = useTranslation();

    const handleAction = async (status) => {
        try {
            await Promise.all(selectedUsers.map(async (userId) => {
                await axios.put(process.env.REACT_APP_API_URL + `/users/${userId}`, {
                    blocked: status
                }, {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                });
            }));
            await refetch();
        } catch (error) {
            console.error(`Error changing blocked:`, error);
        }
    };

    const handleAdmin = async (roleId) => {
        try {
            await Promise.all(selectedUsers.map(async (userId) => {
                await axios.put(process.env.REACT_APP_API_URL + `/users/${userId}`, {
                    role: roleId
                }, {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                });
            }));
            // Update current user's role if they changed their own role
            if (selectedUsers.includes(user.id)) {
                const newRole = roleId === 1 ? 'Authenticated' : 'Admin';
                updateRole(newRole);
            }
            await refetch();
        } catch (error) {
            console.error(`Error changing role:`, error);
        }
    };

    const handleDeleteUser = async () => {
        try {
            await Promise.all(selectedUsers.map(async (userId) => {
                await axios.delete(process.env.REACT_APP_API_URL + `/users/${userId}?populate=*`, {
                    headers: {
                        Authorization: `Bearer ${jwt}`
                    }
                });
            }));
            setSelectedUsers([]);
            refetch();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleSelectAll = () => {
        setSelectedUsers(selectedUsers.length === data.length
            ? []
            : data.map(user => user.id));
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(selectedUsers.includes(userId)
            ? selectedUsers.filter(id => id !== userId)
            : [...selectedUsers, userId]);
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
        <Container fluid="md" className='mt-5 mb-5'>
            <h1 className="text-center mb-4 fs-2">{t("users")}</h1>
            <div className='mb-3 d-flex justify-content-start'>
                <button className="btn btn-primary me-3 d-flex align-items-center justify-content-center"
                        onClick={() => handleAction(true)}>
                    <FaLock className="me-1"/>
                    <span>{t("block")}</span>
                </button>
                <button className="btn btn-outline-primary me-3 d-flex align-items-center justify-content-center"
                        onClick={() => handleAction(false)}>
                    <FaLockOpen className="me-1"/>
                    <span>{t("unblock")}</span>
                </button>
                <button className="btn btn-warning me-3 d-flex align-items-center justify-content-center"
                        onClick={() => handleAdmin(3)}> {/* Assuming role ID 4 is for Admin */}
                    <GrUserAdmin className="me-1"/>
                    <span>{t("admin")}</span>
                </button>
                <button className="btn btn-outline-warning me-3 d-flex align-items-center justify-content-center"
                        onClick={() => handleAdmin(1)}> {/* Assuming role ID 1 is for Authenticated */}
                    <FaUserLock className="me-1"/>
                    <span>{t("not_admin")}</span>
                </button>
                <button className="btn btn-danger d-flex align-items-center justify-content-center"
                        onClick={handleDeleteUser}>
                    <RiDeleteBin6Line className="me-1"/>
                    <span>{t("delete")}</span>
                </button>
            </div>
            <Table striped bordered hover responsive="md">
                <thead className="bg-dark text-white">
                <tr>
                    <th>
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedUsers.length === data?.length}
                            onChange={handleSelectAll}
                        />
                    </th>
                    <th>{t("id")}</th>
                    <th>{t("username")}</th>
                    <th>{t("email")}</th>
                    <th>{t("registration_date")}</th>
                    <th>{t("last_update_date")}</th>
                    <th>{t("status")}</th>
                    <th>{t("confirmed")}</th>
                    <th>{t("role")}</th>
                    <th>{t("collections_list")}</th>
                </tr>
                </thead>
                <tbody>
                {data.map((user) => (
                    <tr key={user.id} className={user.blocked === true ? 'table-primary' : ''}>
                        <td>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleSelectUser(user.id)}
                            />
                        </td>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{formatDate(user.updatedAt)}</td>
                        <td>{user.blocked ? t("blocked") : t("active")}</td>
                        <td>{user.confirmed ? t("yes") : t("no")}</td>
                        <td>{user?.role?.type === "admin" ? t("admin") : t("authenticated")}</td>
                        <td className='d-flex flex-column'>
                            {user?.collections.length && (
                                user?.collections?.map((collection) => (
                                    <NavLink
                                        to={`/collections/${user.id}`}
                                        key={collection.id}
                                    >
                                        {collection.name}
                                    </NavLink>
                                )))
                            }
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default AdminPanel;

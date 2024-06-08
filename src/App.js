import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import NavbarComponent from "./components/NavbarComponent/NavbarComponent";
import Home from "./pages/Home/Home";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import Collection from "./components/Collection/Collection";
import Collections from "./components/Collections/Collections";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import ItemDetails from "./components/ItemDetails/ItemDetails";
import EditItem from "./components/EditItem/EditItem";
import EditCollection from "./components/EditCollection/EditCollection";
import NotFound from "./components/NotFound/NotFound";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import SearchResults from "./components/NavbarComponent/SearchResults";
import UserProfile from "./components/UserProfile/UserProfile";
import Footer from "./components/Footer/Footer";
import TicketForm from "./components/TicketForm/TicketForm";


const Layout = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <NavbarComponent/>
            <div className="flex-grow-1">
                <Outlet/>
            </div>
            <Footer/>
        </div>
    );
};



const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        errorElement: <NotFound/>,
        children: [
            {
                path: "/",
                element: <Home/>
            },
            {
                path: "/register",
                element: <Register/>
            },
            {
                path: "/login",
                element: <Login/>
            },
            {
                path: "/collection/:id",
                element: <Collection/>
            },
            {
                path: "/collections/:userId?",
                element: <Collections/>
            },
            {
                path: "/edit-collection/:id",
                element: <EditCollection/>
            },
            {
                path: "/edit-item/:id",
                element: <EditItem/>
            },
            {
                path: "/adminPanel",
                element: (
                    <ProtectedRoute requiredRole="admin">
                        <AdminPanel/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/item/:id",
                element: <ItemDetails/>
            },
            {
                path: "/search",
                element: <SearchResults/>
            },
            {
                path: "/ticket-form",
                element: <TicketForm/>
            },
            {
                path: "/user-profile",
                element: <UserProfile/>
            },
        ]
    },
]);

const App = () => {
    return (
        <RouterProvider router={router}/>
    )
        ;
};

export default App;
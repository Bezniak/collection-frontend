import React, {Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './18n';
import Preloader from "./components/Preloader/Preloader";
import {AuthProvider} from "./context/AuthContext";
import {ToastContainer} from "react-toastify";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // <React.StrictMode>
    <AuthProvider>
        <Suspense fallback={<Preloader/>}>
            <App/>
            <ToastContainer/>
        </Suspense>
    </AuthProvider>
    // </React.StrictMode>
);


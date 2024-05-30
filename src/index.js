import React, {Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './18n';
import Preloader from "./components/Preloader/Preloader";
import {AuthProvider} from "./context/AuthContext";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <Suspense fallback={<Preloader/>}>
            <App/>
            <ToastContainer/>
        </Suspense>
    </AuthProvider>
);


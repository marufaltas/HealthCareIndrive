import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminPage from "./AdminPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin-services" element={<AdminPage />} />
    </Routes>
  </Router>
);
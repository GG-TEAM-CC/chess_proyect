import React from 'react';
import ReactDOM from 'react-dom/client';
import { LandingPage } from './presentation/pages/LandingPage';
import './presentation/styles/landing.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>
);

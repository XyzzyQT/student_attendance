import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AttendanceProvider } from './context/AttendanceContext';
import './styles/App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AttendanceProvider>
        <App />
      </AttendanceProvider>
    </BrowserRouter>
  </React.StrictMode>
);

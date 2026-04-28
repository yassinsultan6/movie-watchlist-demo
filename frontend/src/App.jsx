import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NotificationContext from './context/NotificationContext';

import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Notification from './components/Notification';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchlistPage from './pages/WatchlistPage';
import MoviesPage from './pages/MoviesPage';
import AdminPage from './pages/AdminPage';

// Notification context is defined in a separate file

function App() {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <AuthProvider>
      <NotificationContext.Provider value={{ showNotification }}>
        <Router>
          <Header />
          <Notification notification={notification} onClose={closeNotification} />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes — any authenticated user */}
              <Route element={<PrivateRoute />}>
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/movies" element={<MoviesPage />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<PrivateRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Routes>
          </main>
        </Router>
      </NotificationContext.Provider>
    </AuthProvider>
  );
}

export default App;

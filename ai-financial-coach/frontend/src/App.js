import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Onboarding from './components/Onboarding';
import GoalSetter from './components/GoalSetter';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    // For now, we'll start with no user logged in
    // Later you can add localStorage persistence
    setIsLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    // Store user in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleRegister = (user) => {
    setCurrentUser(user);
    // Store user in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              currentUser ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/register" 
            element={
              currentUser ? 
                <Navigate to="/dashboard" replace /> : 
                <Register onRegister={handleRegister} />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/onboard" 
            element={
              currentUser ? 
                <Onboarding user={currentUser} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/goals" 
            element={
              currentUser ? 
                <GoalSetter user={currentUser} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              currentUser ? 
                <Dashboard user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* Default route */}
          <Route 
            path="/" 
            element={
              currentUser ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
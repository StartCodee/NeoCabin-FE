import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DocumentRegistration from './components/DocumentRegistration';
import DocumentSearch from './components/DocumentSearch';
import DocumentDetails from './components/DocumentDetails';
import BorrowingSystem from './components/BorrowingSystem';
import Monitoring from './components/Monitoring';
import Layout from './components/Layout';
import FaceRecognition from './components/FaceRecognition';

// Import context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/register" element={<DocumentRegistration />} />
                      <Route path="/search" element={<DocumentSearch />} />
                      <Route path="/document/:id" element={<DocumentDetails />} />
                      <Route path="/borrowing" element={<BorrowingSystem />} />
                      <Route path="/monitoring" element={<Monitoring />} />
                      <Route path="/face-recognition" element={<FaceRecognition />} />


                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
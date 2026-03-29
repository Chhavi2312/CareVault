/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Upload from './pages/Upload';
import Layout from './components/Layout';
import Landing from './pages/Landing';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={!isAuthenticated ? <Auth setAuth={setIsAuthenticated} /> : <Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={isAuthenticated ? <Layout setAuth={setIsAuthenticated} /> : <Navigate to="/auth" />}>
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="upload" element={<Upload />} />
        </Route>
      </Routes>
    </Router>
  );
}


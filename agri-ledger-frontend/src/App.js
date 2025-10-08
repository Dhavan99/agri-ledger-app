// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import HomePage from './pages/HomePage';
import FarmerDetailPage from './pages/FarmerDetailPage';
import RegisterPage from './pages/RegisterPage'; // Import new page
import LoginPage from './pages/LoginPage';       // Import new page
import ProtectedRoute from './components/ProtectedRoute'; // Import protected route
import RegisterPage from './pages/RegisterPage'; // Add this import at the top


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/farmer/:farmerId" element={<FarmerDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
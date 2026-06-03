/**
 * @file App.jsx
 * @description Root component of the frontend application.
 * Handles global state providers (Auth), routing configuration, 
 * lazy loading of pages, and protected route management.
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import api from './api';

/**
 * Lazy-loaded page components for performance optimization.
 * Each import is split into a separate chunk by Vite.
 */
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Inspection = lazy(() => import('./pages/Inspection'));
const Contract = lazy(() => import('./pages/Contract'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const Terms = lazy(() => import('./pages/Terms'));

function App() {
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/settings');
        const config = res.data;
        if (config && config.primaryColor) {
          document.documentElement.style.setProperty('--premium-gold', config.primaryColor);
          document.documentElement.style.setProperty('--color-premium-gold', config.primaryColor);
          document.documentElement.style.setProperty('--color-premium-gold-light', config.primaryColor + 'E6');
        }
      } catch (err) {
        console.error('Failed to load settings from server:', err);
        // Fallback to local storage if API fails
        const saved = localStorage.getItem('loc34_home_config');
        if (saved) {
          try {
            const config = JSON.parse(saved);
            if (config.primaryColor) {
              document.documentElement.style.setProperty('--premium-gold', config.primaryColor);
              document.documentElement.style.setProperty('--color-premium-gold', config.primaryColor);
              document.documentElement.style.setProperty('--color-premium-gold-light', config.primaryColor + 'E6');
            }
          } catch (_parseError) {
            console.debug('Could not parse loc34_home_config:', _parseError);
          }
        }
      }
    };
    loadSettings();
  }, []);

  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen flex flex-col bg-white">
          <Toaster position="top-right" />
          <Header />
          <main className="flex-grow">
            <ErrorBoundary>
              {/* Suspense fallback displayed while lazy components are loading */}
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-premium-gold border-t-transparent rounded-full animate-spin"></div></div>}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/car/:id" element={<CarDetails />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/confirmation" element={<Confirmation />} />
                  <Route path="/terms" element={<Terms />} />
                  
                  {/* Admin Protected Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/admin/inspection/:bookingId" 
                    element={
                      <ProtectedRoute adminOnly>
                        <Inspection />
                      </ProtectedRoute>
                    } 
                  />

                  {/* User Protected Routes */}
                  <Route 
                    path="/my-bookings" 
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/contract/:bookingId" 
                    element={
                      <ProtectedRoute>
                        <Contract />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
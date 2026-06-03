/**
 * @file pages/Login.jsx
 * @description Login page. Delegates to AuthContext.login() which calls POST /api/login.
 * On success, redirects to the page the user originally tried to access, or home.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await login(formData.email, formData.password);
      toast.success(`Bienvenue, ${userData.name || 'utilisateur'} !`);
      // Redirect admins to dashboard, others to their intended destination
      navigate(userData.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Identifiants incorrects.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-light-gray flex items-center justify-center px-4">
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="text-center mb-14">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-premium-gold mb-4">
            Loc 34
          </p>
          <h1 className="text-4xl font-serif text-premium-black">Connexion</h1>
        </div>

        <div className="bg-white p-12 border border-gray-100 shadow-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-bold ml-2">✕</button>
            </div>
          )}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block"
              >
                Adresse e-mail
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block"
              >
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-premium-black text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-premium-gold transition-all duration-500 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-[9px] uppercase tracking-widest text-gray-400">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="text-premium-gold hover:text-premium-black transition-colors font-bold"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default Login;

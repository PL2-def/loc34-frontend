/**
 * @file pages/Register.jsx
 * @description Registration page. Delegates to AuthContext.register() → POST /api/register.
 * On success, redirects to login with a success toast.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.name);
      toast.success('Compte créé avec succès ! Veuillez vous connecter.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-premium-light-gray flex items-center justify-center px-4 py-16">
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
          <h1 className="text-4xl font-serif text-premium-black">Créer un compte</h1>
        </div>

        <div className="bg-white p-12 border border-gray-100 shadow-sm">
          <form id="register-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label
                htmlFor="reg-name"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block"
              >
                Nom complet
              </label>
              <input
                id="reg-name"
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                placeholder="Jean Dupont"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reg-email"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block"
              >
                Adresse e-mail
              </label>
              <input
                id="reg-email"
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
                htmlFor="reg-password"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block"
              >
                Mot de passe
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                placeholder="Minimum 6 caractères"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reg-confirm"
                className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="reg-confirm"
                type="password"
                name="confirm"
                required
                autoComplete="new-password"
                value={formData.confirm}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-premium-black text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-premium-gold transition-all duration-500 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-[9px] uppercase tracking-widest text-gray-400">
            Déjà inscrit ?{' '}
            <Link
              to="/login"
              className="text-premium-gold hover:text-premium-black transition-colors font-bold"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </Motion.div>
    </div>
  );
};

export default Register;

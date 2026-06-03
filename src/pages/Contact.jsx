/**
 * @file pages/Contact.jsx
 * @description Static Contact page.
 */

import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    setTimeout(() => {
      toast.success('Votre message a bien été envoyé. Notre équipe vous contactera sous peu.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-premium-black text-white pt-32 pb-20 px-6 md:px-12 text-center">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-premium-gold mb-6">
            Nous Contacter
          </p>
          <h1 className="text-4xl md:text-5xl font-serif mb-6">
            La Conciergerie
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
            Notre équipe se tient à votre entière disposition pour répondre à vos demandes spécifiques, 
            organiser une livraison sur mesure ou vous conseiller sur le choix de votre véhicule.
          </p>
        </Motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-12">
            <h2 className="text-2xl font-serif text-premium-black mb-8">
              Informations Pratiques
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-premium-light-gray flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-premium-gold" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">Agence Principale</h3>
                  <p className="text-sm text-gray-500">123 Rue de la Location</p>
                  <p className="text-sm text-gray-500">34500 Béziers, France</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-premium-light-gray flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-premium-gold" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">Email</h3>
                  <p className="text-sm text-gray-500">pl2def24@gmail.com</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-premium-light-gray flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-premium-gold" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2">Horaires</h3>
                  <p className="text-sm text-gray-500">Lundi - Vendredi : 08:00 - 20:00</p>
                  <p className="text-sm text-gray-500">Samedi : 09:00 - 18:00</p>
                  <p className="text-sm text-gray-500">Dimanche : Sur rendez-vous exclusif</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-100 p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl font-serif text-premium-black mb-8">
              Envoyer un message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
                  Sujet de votre demande
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                >
                  <option value="" disabled>Sélectionnez un sujet</option>
                  <option value="reservation">Nouvelle réservation</option>
                  <option value="modification">Modification d'une réservation</option>
                  <option value="entreprise">Demande entreprise / B2B</option>
                  <option value="evenement">Événement spécial</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">
                  Votre message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-premium-black text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-premium-gold transition-all duration-500 disabled:opacity-50 mt-4"
              >
                {loading ? 'Envoi...' : 'Envoyer la demande'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

/**
 * @file pages/MyBookings.jsx
 * @description Authenticated user's booking history.
 * - GET /api/bookings/my-bookings → list user bookings with vehicle info
 * - GET /api/bookings/:id/invoice → download PDF invoice
 * Booking statuses: "pending" | "confirmed" | "completed" | "cancelled"
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Car, Calendar, Tag, Key, Lock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { formatPrice } from '../utils/calculations';
import { getFullImageUrl } from '../utils/imageUrl';

const STATUS_STYLES = {
  pending:   { label: 'En attente',  classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  confirmed: { label: 'Confirmée',   classes: 'bg-green-50 text-green-700 border border-green-200' },
  completed: { label: 'Terminée',    classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
  cancelled: { label: 'Annulée',     classes: 'bg-red-50 text-red-700 border border-red-200' },
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/user/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success('Mot de passe modifié avec succès !');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Erreur lors de la modification du mot de passe.';
      toast.error(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        setBookings(res.data);
      } catch {
        toast.error('Impossible de charger vos réservations.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      const token = localStorage.getItem('token');
      const res = await fetch(`${baseUrl}/bookings/${bookingId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${bookingId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Impossible de télécharger la facture.');
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-light-gray">
      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-gray-100 max-w-md w-full shadow-2xl p-8 relative rounded-xl"
            >
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-premium-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-premium-gold">
                  <Key size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-serif text-premium-black">Modifier le mot de passe</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sécuriser votre compte</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-premium-gold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">
                    Nouveau mot de passe (min 6 car.)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-premium-gold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm outline-none focus:border-premium-gold transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-premium-black hover:bg-premium-gold text-white text-[10px] font-bold uppercase tracking-[0.2em] py-4 transition-all duration-300 disabled:opacity-50 mt-6 shadow-md"
                >
                  {passwordLoading ? 'Mise à jour...' : 'Enregistrer'}
                </button>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-16">
        {/* Header */}
        <div className="mb-14 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-premium-gold mb-3">
              Mon Espace
            </p>
            <h1 className="text-4xl font-serif text-premium-black">Mes Réservations</h1>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="self-start sm:self-center bg-premium-black hover:bg-premium-gold text-white text-[10px] font-bold uppercase tracking-[0.25em] px-6 py-3.5 transition-all duration-300 shadow-sm"
          >
            Sécurité compte
          </button>
        </div>

        {bookings.length === 0 ? (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white border border-gray-100"
          >
            <Car size={40} className="mx-auto text-gray-300 mb-6" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              Aucune réservation pour le moment
            </p>
            <Link
              to="/"
              className="inline-block bg-premium-black text-white text-[10px] font-bold uppercase tracking-[0.3em] px-10 py-4 hover:bg-premium-gold transition-all duration-500"
            >
              Découvrir nos véhicules
            </Link>
          </Motion.div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => {
              const status = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
              const vehicle = booking.vehicle;
              return (
                <Motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Vehicle thumbnail */}
                    <div className="md:w-48 h-40 md:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
                      <img
                        src={getFullImageUrl(vehicle?.image_url)}
                        alt={vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-premium-gold mb-1">
                            {vehicle?.brand}
                          </p>
                          <h2 className="text-xl font-serif text-premium-black">
                            {vehicle?.model}
                          </h2>
                        </div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-widest px-4 py-2 ${status.classes}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar size={13} className="text-premium-gold flex-shrink-0" />
                          <div>
                            <p className="text-[8px] uppercase tracking-widest">Période</p>
                            <p className="text-xs font-bold">
                              {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Tag size={13} className="text-premium-gold flex-shrink-0" />
                          <div>
                            <p className="text-[8px] uppercase tracking-widest">Total</p>
                            <p className="text-xs font-bold text-premium-black">
                              {formatPrice(booking.total_price)}
                            </p>
                          </div>
                        </div>
                        {booking.delivery_location && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Car size={13} className="text-premium-gold flex-shrink-0" />
                            <div>
                              <p className="text-[8px] uppercase tracking-widest">Livraison</p>
                              <p className="text-xs font-bold">{booking.delivery_location}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100">
                        {(booking.status === 'confirmed' || booking.status === 'completed') && (
                          <>
                            <button
                              id={`invoice-btn-${booking.id}`}
                              onClick={() => handleDownloadInvoice(booking.id)}
                              className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-premium-gold transition-colors"
                            >
                              <Download size={13} />
                              Télécharger la facture
                            </button>
                            {booking.status === 'confirmed' && (
                              <Link
                                to={`/contract/${booking.id}`}
                                id={`contract-link-${booking.id}`}
                                className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-premium-gold hover:text-premium-black transition-colors"
                              >
                                <FileText size={13} />
                                Signer le contrat
                              </Link>
                            )}
                          </>
                        )}
                        <span className="text-[8px] text-gray-300 uppercase tracking-widest ml-auto self-end">
                          Réservation #{booking.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

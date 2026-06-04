/**
 * @file pages/Contract.jsx
 * @description Digital contract signing page for a confirmed booking.
 * - Fetches booking details from GET /api/bookings/my-bookings (filtered by bookingId)
 * - POST /api/bookings/:id/sign-contract  { signature: dataUrl }
 *
 * The backend stores the signature_url directly in the Contract table.
 * Access is protected: booking.user_id must match req.user.id.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FileCheck, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { formatPrice } from '../utils/calculations';

const Contract = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        const found = res.data.find((b) => b.id === Number(bookingId));
        if (!found) {
          toast.error('Réservation introuvable.');
          navigate('/my-bookings');
          return;
        }
        setBooking(found);
        if (found.contract && found.contract.signature_url) {
          setAgreed(true);
        }
      } catch {
        toast.error('Impossible de charger la réservation.');
        navigate('/my-bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  const handleSign = async (signatureText) => {
    setSigning(true);
    try {
      await api.post(`/bookings/${bookingId}/sign-contract`, {
        signature: signatureText,
      });
      toast.success('Contrat signé avec succès !');
      // Fetch fresh details or reload
      const res = await api.get('/bookings/my-bookings');
      const found = res.data.find((b) => b.id === Number(bookingId));
      if (found) setBooking(found);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Erreur lors de la signature.';
      toast.error(msg);
    } finally {
      setSigning(false);
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

  if (!booking) return null;

  const vehicle = booking.vehicle;

  return (
    <div className="min-h-screen bg-premium-light-gray">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-premium-gold mb-3">
            Loc 34
          </p>
          <h1 className="text-4xl font-serif text-premium-black">Contrat de Location</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-3">
            Réservation #{booking.id}
          </p>
        </div>

        {/* Contract document */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 shadow-sm p-10 md:p-16 space-y-10"
        >
          {/* Parties */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              Parties du Contrat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-premium-light-gray p-6">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-3">Loueur</p>
                <p className="font-bold text-sm">Loc 34 S.A.</p>
                <p className="text-xs text-gray-500 mt-1">123 Rue de la Location</p>
                <p className="text-xs text-gray-500">34500 Béziers, France</p>
              </div>
              <div className="bg-premium-light-gray p-6">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-3">Locataire</p>
                <p className="font-bold text-sm">{booking.user?.name || 'Client'}</p>
                <p className="text-xs text-gray-500 mt-1">{booking.user?.email}</p>
              </div>
            </div>
          </section>

          {/* Vehicle details */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              Véhicule Loué
            </h2>
            <div className="border border-gray-100 p-6">
              <p className="text-lg font-serif text-premium-black">
                {vehicle?.brand} {vehicle?.model}
              </p>
              <p className="text-xs text-gray-400 mt-1">{vehicle?.year} — {vehicle?.category}</p>
              <p className="text-xs text-gray-500 mt-3">
                Tarif journalier : <strong>{vehicle?.price_per_day}€</strong>
              </p>
            </div>
          </section>

          {/* Rental period */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              Période de Location
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-100 p-6 text-center">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-2">Début</p>
                <p className="font-bold text-sm">{formatDate(booking.start_date)}</p>
              </div>
              <div className="border border-gray-100 p-6 text-center">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-2">Fin</p>
                <p className="font-bold text-sm">{formatDate(booking.end_date)}</p>
              </div>
            </div>
            {booking.delivery_location && (
              <p className="text-xs text-gray-500 mt-4">
                Lieu de livraison :{' '}
                <strong className="text-premium-black">{booking.delivery_location}</strong>
              </p>
            )}
          </section>

          {/* Financial summary */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              Récapitulatif Financier
            </h2>
            <div className="border border-gray-100 p-6">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-gray-500">Total TTC</span>
                <span className="text-2xl font-serif text-premium-black">
                  {formatPrice(booking.total_price)}
                </span>
              </div>
              {booking.promotion_code && (
                <p className="text-xs text-green-600 mt-3">
                  Code promotionnel appliqué : <strong>{booking.promotion_code}</strong>
                </p>
              )}
              <p className="text-[8px] text-gray-400 mt-4 uppercase tracking-widest">
                Paiement effectué par carte bancaire — statut : {booking.deposit_status}
              </p>
            </div>
          </section>

          {/* Conditions */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-4">
              Conditions Générales
            </h2>
            <ul className="space-y-2 text-xs text-gray-500 leading-relaxed list-disc list-inside">
              <li>Le locataire s'engage à utiliser le véhicule en bon père de famille.</li>
              <li>Tout dommage non signalé lors de l'état des lieux sera facturé au locataire.</li>
              <li>Le carburant est à la charge du locataire. Le véhicule doit être restitué avec le niveau de carburant initial.</li>
              <li>Toute modification ou sous-location du véhicule est strictement interdite.</li>
              <li>En cas de sinistre, le locataire doit en informer Loc 34 dans les 24 heures.</li>
              <li>La franchise applicable est celle indiquée dans les conditions particulières.</li>
            </ul>
          </section>

          {/* Signature section */}
          <section className="border-t border-gray-100 pt-8">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              Signature Électronique
            </h2>

            {booking.contract && booking.contract.signature_url ? (
              <div className="border border-dashed border-gray-300 p-6 bg-gray-50 flex flex-col items-center justify-center rounded-lg">
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 mb-2">Contrat signé électroniquement</p>
                {booking.contract.signature_url.startsWith('data:image') || booking.contract.signature_url.includes('/') ? (
                  <img src={booking.contract.signature_url} alt="Signature" className="max-h-24 object-contain mb-2 bg-white p-2 border border-gray-200" />
                ) : (
                  <p className="text-sm font-serif italic my-3 text-gray-800 border border-gray-200 bg-white p-4 font-bold tracking-wide animate-fade">
                    {booking.contract.signature_url}
                  </p>
                )}
                <p className="text-[9px] text-gray-400">Le {formatDate(booking.contract.signed_at || booking.contract.created_at)}</p>
              </div>
            ) : (
              <>
                <label className="flex items-start gap-3 cursor-pointer mb-8">
                  <input
                    id="contract-agree-checkbox"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 accent-premium-gold"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    J'ai lu et j'accepte les conditions générales de location de Loc 34.
                    Je certifie que les informations fournies sont exactes et m'engage à respecter
                    les termes du présent contrat.
                  </span>
                </label>

                {!agreed && (
                  <div className="flex items-center gap-3 text-yellow-700 bg-yellow-50 border border-yellow-200 px-4 py-3 mb-6">
                    <AlertTriangle size={14} />
                    <p className="text-[9px] uppercase tracking-widest">
                      Veuillez accepter les conditions avant de signer.
                    </p>
                  </div>
                )}

                <button
                  id="sign-contract-btn"
                  onClick={() => handleSign(`Accepté électroniquement par ${booking.user?.name || 'Client'}`)}
                  disabled={!agreed || signing}
                  className="flex items-center gap-3 w-full py-5 bg-premium-black text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-premium-gold transition-all duration-500 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {signing ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signature en cours...
                    </>
                  ) : (
                    <>
                      <FileCheck size={16} />
                      Valider et signer le contrat
                    </>
                  )}
                </button>
              </>
            )}
          </section>
        </Motion.div>
      </div>
    </div>
  );
};

export default Contract;

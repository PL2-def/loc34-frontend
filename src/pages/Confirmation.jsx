/**
 * @file pages/Confirmation.jsx
 * @description Post-booking confirmation page.
 * Shown after a successful POST /api/bookings.
 * Provides navigation to MyBookings and back to Home.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { CheckCircle, Briefcase, Home } from 'lucide-react';

const Confirmation = () => {
  return (
    <div className="min-h-screen bg-premium-light-gray flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <Motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="flex justify-center mb-10"
        >
          <div className="w-24 h-24 border border-premium-gold flex items-center justify-center">
            <CheckCircle size={40} className="text-premium-gold" />
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-premium-gold mb-4">
            Réservation Confirmée
          </p>
          <h1 className="text-4xl font-serif text-premium-black mb-6">
            Merci pour votre confiance
          </h1>
           <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-12">
            Votre réservation a bien été enregistrée et votre contrat de location a été signé électroniquement. 
            Vous pouvez consulter votre contrat signé et télécharger votre facture depuis votre espace personnel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/my-bookings"
              id="goto-my-bookings-btn"
              className="flex items-center justify-center gap-3 px-10 py-5 bg-premium-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-premium-gold transition-all duration-500"
            >
              <Briefcase size={14} />
              Mes Réservations
            </Link>
            <Link
              to="/"
              id="goto-home-btn"
              className="flex items-center justify-center gap-3 px-10 py-5 border border-premium-black text-premium-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-premium-black hover:text-white transition-all duration-500"
            >
              <Home size={14} />
              Retour à l'accueil
            </Link>
          </div>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-10 border-t border-gray-200"
        >
          <p className="text-[8px] uppercase tracking-widest text-gray-400">
            Loc 34 — pl2def24@gmail.com
          </p>
        </Motion.div>
      </div>
    </div>
  );
};

export default Confirmation;

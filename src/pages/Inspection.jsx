/**
 * @file pages/Inspection.jsx
 * @description Admin-only vehicle inspection form for a specific booking.
 * Route: /admin/inspection/:bookingId
 * - POST /api/admin/inspections
 *   body: { booking_id, type, inspector_name, mileage, fuel_level, notes, images }
 *
 * type: "before" | "after"
 * When type === "after", the backend also updates vehicle.current_mileage.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Gauge, Droplets, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

const INSPECTION_TYPES = [
  { value: 'before', label: 'État des lieux — Départ' },
  { value: 'after',  label: 'État des lieux — Retour' },
];

const Inspection = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  const [form, setForm] = useState({
    type: 'before',
    inspector_name: '',
    mileage: '',
    fuel_level: '1.0',
    notes: '',
  });
  const [damages, setDamages] = useState([{ description: '', severity: 'minor' }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // Admin can see all bookings via /api/admin/bookings
        const res = await api.get('/admin/bookings');
        const found = res.data.find((b) => b.id === Number(bookingId));
        if (!found) {
          toast.error('Réservation introuvable.');
          navigate('/admin');
          return;
        }
        setBooking(found);
      } catch {
        toast.error('Impossible de charger la réservation.');
        navigate('/admin');
      } finally {
        setLoadingBooking(false);
      }
    };
    fetchBooking();
  }, [bookingId, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addDamage = () => {
    setDamages((prev) => [...prev, { description: '', severity: 'minor' }]);
  };

  const removeDamage = (idx) => {
    setDamages((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateDamage = (idx, field, value) => {
    setDamages((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.inspector_name.trim()) {
      toast.error("Veuillez saisir le nom de l'inspecteur.");
      return;
    }
    if (!form.mileage || Number(form.mileage) < 0) {
      toast.error('Veuillez saisir un kilométrage valide.');
      return;
    }

    setSubmitting(true);
    try {
      // Build images array from damage notes (simplified — in prod this would be file uploads)
      const imagesPayload = damages
        .filter((d) => d.description.trim())
        .map((d) => `[${d.severity.toUpperCase()}] ${d.description}`);

      await api.post('/admin/inspections', {
        booking_id: Number(bookingId),
        type: form.type,
        inspector_name: form.inspector_name.trim(),
        mileage: Number(form.mileage),
        fuel_level: parseFloat(form.fuel_level),
        notes: form.notes.trim() || null,
        images: imagesPayload,
      });

      toast.success('Inspection enregistrée avec succès !');
      navigate('/admin');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Erreur lors de l'enregistrement.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  if (loadingBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-light-gray">
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-premium-gold mb-3">
            Administration
          </p>
          <h1 className="text-4xl font-serif text-premium-black">Fiche d'Inspection</h1>
          {booking && (
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-3">
              {booking.brand} {booking.model} — Réservation #{booking.id}
              {booking.user_name && ` — ${booking.user_name}`}
            </p>
          )}
        </div>

        {/* Booking summary strip */}
        {booking && (
          <div className="bg-white border border-gray-100 p-6 mb-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[8px] uppercase tracking-widest text-gray-400 mb-1">Début</p>
              <p className="text-xs font-bold">{formatDate(booking.start_date)}</p>
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-widest text-gray-400 mb-1">Fin</p>
              <p className="text-xs font-bold">{formatDate(booking.end_date)}</p>
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-widest text-gray-400 mb-1">Statut</p>
              <p className="text-xs font-bold uppercase">{booking.status}</p>
            </div>
          </div>
        )}

        <Motion.form
          id="inspection-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 shadow-sm p-10 space-y-10"
        >
          {/* Type selector */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              Type d'Inspection
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {INSPECTION_TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`flex items-center gap-3 p-5 border cursor-pointer transition-all ${
                    form.type === t.value
                      ? 'border-premium-gold bg-premium-gold/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={form.type === t.value}
                    onChange={handleChange}
                    className="accent-premium-gold"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Inspector + readings */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              Informations Générales
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="inspector-name"
                  className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block"
                >
                  Nom de l'inspecteur
                </label>
                <input
                  id="inspector-name"
                  type="text"
                  name="inspector_name"
                  required
                  value={form.inspector_name}
                  onChange={handleChange}
                  placeholder="Prénom NOM"
                  className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label
                    htmlFor="inspection-mileage"
                    className="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2"
                  >
                    <Gauge size={12} /> Kilométrage
                  </label>
                  <input
                    id="inspection-mileage"
                    type="number"
                    name="mileage"
                    required
                    min="0"
                    value={form.mileage}
                    onChange={handleChange}
                    placeholder="Ex: 45000"
                    className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="inspection-fuel"
                    className="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2"
                  >
                    <Droplets size={12} /> Niveau carburant
                  </label>
                  <select
                    id="inspection-fuel"
                    name="fuel_level"
                    value={form.fuel_level}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-gray-200 py-3 outline-none focus:border-premium-gold transition-colors text-sm"
                  >
                    {[
                      { v: '1.0', l: 'Plein (1/1)' },
                      { v: '0.75', l: '3/4' },
                      { v: '0.5', l: '1/2' },
                      { v: '0.25', l: '1/4' },
                      { v: '0.1', l: 'Réserve' },
                    ].map(({ v, l }) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Damages */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold">
                Dommages Constatés
              </h2>
              <button
                type="button"
                id="add-damage-btn"
                onClick={addDamage}
                className="text-[9px] font-bold uppercase tracking-widest text-premium-gold hover:text-premium-black transition-colors"
              >
                + Ajouter
              </button>
            </div>
            <div className="space-y-4">
              {damages.map((d, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-premium-light-gray p-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={d.description}
                      onChange={(e) => updateDamage(idx, 'description', e.target.value)}
                      placeholder="Description du dommage"
                      className="w-full bg-white border-b border-gray-200 py-2 px-3 outline-none focus:border-premium-gold transition-colors text-sm"
                    />
                  </div>
                  <div className="flex gap-3 items-center">
                    <select
                      value={d.severity}
                      onChange={(e) => updateDamage(idx, 'severity', e.target.value)}
                      className="flex-1 bg-white border-b border-gray-200 py-2 px-2 outline-none focus:border-premium-gold text-sm"
                    >
                      <option value="minor">Mineur</option>
                      <option value="moderate">Modéré</option>
                      <option value="major">Majeur</option>
                    </select>
                    {damages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDamage(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              <FileText size={12} className="inline mr-2" />
              Notes Complémentaires
            </h2>
            <textarea
              id="inspection-notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Observations générales, remarques particulières..."
              className="w-full bg-transparent border border-gray-200 p-4 outline-none focus:border-premium-gold transition-colors text-sm resize-none"
            />
          </section>

          {/* Submit */}
          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex-1 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-premium-black transition-colors border border-gray-200 hover:border-gray-400"
            >
              Annuler
            </button>
            <button
              id="inspection-submit"
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-premium-black text-white font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-premium-gold transition-all duration-500 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Valider l'Inspection
                </>
              )}
            </button>
          </div>
        </Motion.form>
      </div>
    </div>
  );
};

export default Inspection;

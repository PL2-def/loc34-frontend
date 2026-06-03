/**
 * @file pages/Home.jsx
 * @description Public landing page displaying available vehicles.
 * Fetches from GET /api/vehicles and supports category filtering.
 */

import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import api from '../api';
import CarCard from '../components/CarCard';

const Home = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState(['Tous']);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeConfig, setHomeConfig] = useState({
    heroTitle: "Location de Voitures\nSimple & Rapide",
    heroSubtitle: 'Une large gamme de véhicules adaptés à tous vos besoins au meilleur prix.',
    siteName: 'Loc 34',
    announcementText: 'Profitez de -10% sur votre première réservation avec le code LOC34 !',
    announcementVisible: true,
  });

  useEffect(() => {
    const fetchVehiclesAndSettings = async () => {
      try {
        const [vehiclesRes, settingsRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/settings').catch(err => {
            console.error('Settings fetch failed, falling back to defaults/localStorage', err);
            const saved = localStorage.getItem('loc34_home_config');
            try {
              return { data: saved ? JSON.parse(saved) : null };
            } catch (_e) {
              return { data: null };
            }
          })
        ]);

        let data = vehiclesRes.data;
        const config = settingsRes.data;

        if (config) {
          setHomeConfig(prev => ({
            ...prev,
            ...config
          }));
          
          if (config.hiddenCategories && config.hiddenCategories.length > 0) {
            data = data.filter(v => !config.hiddenCategories.includes(v.category));
          }
          if (config.sortOrder === 'price_asc') data.sort((a,b) => a.price_per_day - b.price_per_day);
          if (config.sortOrder === 'price_desc') data.sort((a,b) => b.price_per_day - a.price_per_day);
          if (config.sortOrder === 'brand') data.sort((a,b) => a.brand.localeCompare(b.brand));
          if (config.sortOrder === 'newest') data.sort((a,b) => b.id - a.id);
          if (config.sortOrder === 'custom' && config.customOrder && config.customOrder.length > 0) {
            data.sort((a, b) => {
              const idxA = config.customOrder.indexOf(a.id);
              const idxB = config.customOrder.indexOf(b.id);
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
            });
          }
        }

        setVehicles(data);
        setFiltered(data);
        setCategories(['Tous', ...new Set(data.map(v => v.category).filter(Boolean))]);
      } catch (_err) {
        setError('Impossible de charger les véhicules.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehiclesAndSettings();
  }, []);

  const handleFilter = (category) => {
    setActiveCategory(category);
    if (category === 'Tous') {
      setFiltered(vehicles);
    } else {
      setFiltered(vehicles.filter((v) => v.category === category));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Announcement Bar */}
      {homeConfig.announcementVisible && homeConfig.announcementText && (
        <div className="bg-premium-gold text-white text-center py-2.5 px-4 text-xs font-bold transition-all shadow-sm">
          {homeConfig.announcementText}
        </div>
      )}

      {/* Hero */}
      <section className="bg-premium-black text-white py-20 px-6 md:px-12 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-semibold text-premium-gold uppercase tracking-wider mb-4">
            {homeConfig.siteName}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 whitespace-pre-line">
            {homeConfig.heroTitle}
          </h1>
          <p className="text-gray-300 text-base max-w-2xl">
            {homeConfig.heroSubtitle}
          </p>
        </div>
      </section>

      {/* Category filters */}
      <section className="border-b border-gray-200 sticky top-16 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase()}`}
              onClick={() => handleFilter(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                activeCategory === cat
                  ? 'bg-premium-gold text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Vehicles grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-red-500 text-sm font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-sm">
              Aucun véhicule disponible dans cette catégorie.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-8">
              <p className="text-sm font-semibold text-gray-500">
                {filtered.length} véhicule{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((car) => (
                <div key={car.id}>
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;

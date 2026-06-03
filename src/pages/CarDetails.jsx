/**
 * @file pages/CarDetails.jsx
 * @description Vehicle detail page with booking form.
 * - GET /api/vehicles/:id      → vehicle details
 * - GET /api/vehicles/:id/reviews → customer reviews
 * - GET /api/options           → available booking options
 * - GET /api/promotions        → validate promo code (via booking service)
 * - POST /api/bookings         → create booking (price re-verified server-side)
 *
 * The price calculation here MUST match BookingService exactly:
 * total = (days × price_per_day) + (options × days) + delivery_fee − promo_discount
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Shield, ChevronRight, ChevronLeft, Calendar, X, Info, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import { getFullImageUrl } from '../utils/imageUrl';
import { calculateDays, getDeliveryFee, formatPrice, parseSpecs } from '../utils/calculations';
import PaymentForm from '../components/PaymentForm';

const DELIVERY_OPTIONS = [
  { value: 'Agence', label: 'Agence (Gratuit)', fee: 0 },
  { value: 'Livraison personnalisée', label: 'Livraison personnalisée (+100€)', fee: 100 },
];

const loadLeaflet = (callback) => {
  if (window.L) {
    callback();
    return;
  }

  // Load CSS
  const cssId = 'leaflet-css';
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link');
    link.id = cssId;
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  // Load JS
  const jsId = 'leaflet-js';
  let script = document.getElementById(jsId);
  if (!script) {
    script = document.createElement('script');
    script.id = jsId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => callback();
    document.body.appendChild(script);
  } else {
    script.addEventListener('load', callback);
  }
};

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Agence');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryAddressConfirmed, setDeliveryAddressConfirmed] = useState(false);
  const [deliveryPrecision, setDeliveryPrecision] = useState('');
  const [deliveryLatitude, setDeliveryLatitude] = useState(null);
  const [deliveryLongitude, setDeliveryLongitude] = useState(null);
  const [geolocating, setGeolocating] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDeliveryLatitude(latitude);
        setDeliveryLongitude(longitude);

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            const marker = window.L.marker([latitude, longitude]).addTo(mapRef.current);
            markerRef.current = marker;
          }
        }

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              setDeliveryAddress(data.display_name);
              setDeliveryAddressConfirmed(true);
              toast.success("Adresse trouvée par localisation !");
            } else {
              setDeliveryAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } else {
            setDeliveryAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
        } catch (err) {
          console.error("Error reverse geocoding on geolocate:", err);
          setDeliveryAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Impossible d'accéder à votre position. Veuillez saisir l'adresse manuellement.");
        setGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);

  // Leaflet map initialization
  useEffect(() => {
    if (!deliveryLocation || !deliveryLocation.toLowerCase().includes('personnalisé')) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    let isMounted = true;

    loadLeaflet(() => {
      if (!isMounted || !deliveryLocation || !deliveryLocation.toLowerCase().includes('personnalisé')) return;

      const container = document.getElementById('leaflet-delivery-map');
      if (!container) return;

      if (mapRef.current) {
        mapRef.current.invalidateSize();
        return;
      }

      const defaultLat = 43.6107;
      const defaultLng = 3.8767;

      const map = window.L.map('leaflet-delivery-map').setView(
        deliveryLatitude && deliveryLongitude ? [deliveryLatitude, deliveryLongitude] : [defaultLat, defaultLng],
        11
      );

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapRef.current = map;

      if (deliveryLatitude && deliveryLongitude) {
        const marker = window.L.marker([deliveryLatitude, deliveryLongitude]).addTo(map);
        markerRef.current = marker;
      }

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        setDeliveryLatitude(lat);
        setDeliveryLongitude(lng);

        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          const marker = window.L.marker(e.latlng).addTo(map);
          markerRef.current = marker;
        }

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              setDeliveryAddress(data.display_name);
              setDeliveryAddressConfirmed(true);
            }
          }
        } catch (err) {
          console.error("Error reverse geocoding on map click:", err);
        }
      });

      setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize();
      }, 200);
    });

    return () => {
      isMounted = false;
    };
  }, [deliveryLocation]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);

  // Availability calendar state
  const [bookedRanges, setBookedRanges] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);

  // Active photo state for carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Payment flow
  const [showPayment, setShowPayment] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vRes, rRes, oRes, aRes] = await Promise.all([
          api.get(`/vehicles/${id}`),
          api.get(`/vehicles/${id}/reviews`),
          api.get('/options'),
          api.get(`/vehicles/${id}/availability`),
        ]);
        setVehicle(vRes.data);
        setReviews(rRes.data);
        setOptions(oRes.data);
        setBookedRanges(aRes.data);
      } catch (_err) {
        toast.error('Véhicule introuvable.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, navigate]);

  // Real-time polling to update calendar immediately when other users make bookings
  useEffect(() => {
    if (!id) return;
    const pollAvailability = async () => {
      try {
        const aRes = await api.get(`/vehicles/${id}/availability`);
        // Basic check to avoid redundant state commits
        setBookedRanges((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(aRes.data)) {
            return prev;
          }
          return aRes.data;
        });
      } catch (err) {
        console.error('Failed background availability update:', err);
      }
    };

    const interval = setInterval(pollAvailability, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const isDateBooked = (d) => {
    if (!d) return false;
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    return bookedRanges.some((range) => {
      const start = new Date(range.start_date);
      const end = new Date(range.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return target >= start && target <= end;
    });
  };

  const isDateDisabled = (d) => {
    if (!d) return true;
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);

    const todayVal = new Date();
    todayVal.setHours(0, 0, 0, 0);

    // 1. Cannot be in the past
    if (target < todayVal) return true;

    // 2. Cannot be an already booked date
    if (isDateBooked(target)) return true;

    // 3. If a start date is selected, cannot select a date before the start date
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (target < start) return true;

      // 4. Cannot select a date that would cross an existing booking
      const hasBookedBetween = bookedRanges.some((range) => {
        const bStart = new Date(range.start_date);
        bStart.setHours(0, 0, 0, 0);
        return bStart > start && bStart <= target;
      });
      if (hasBookedBetween) return true;
    }

    return false;
  };

  const handleDayClick = (d) => {
    if (!d || isDateDisabled(d)) return;

    const dateStr = d.toISOString().split('T')[0];

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate('');
      setDiscount(0);
      setPromoApplied(false);
      setPromoCode('');
    } else {
      const start = new Date(startDate);
      if (d < start) {
        setStartDate(dateStr);
      } else {
        setEndDate(dateStr);
        setDiscount(0);
        setPromoApplied(false);
        setPromoCode('');
      }
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

    const totalDays = lastDay.getDate();
    const daysArr = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      daysArr.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      daysArr.push(new Date(year, month, i));
    }

    return daysArr;
  };

  const formatDateFrench = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const changeMonth = (offset) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const days = calculateDays(startDate, endDate);
  const basePrice = vehicle ? days * vehicle.price_per_day : 0;
  const optionsPrice = options
    .filter((o) => selectedOptions.includes(o.id))
    .reduce((sum, o) => sum + o.price * days, 0);
  const deliveryFee = getDeliveryFee(deliveryLocation);
  const totalBeforeDiscount = basePrice + optionsPrice + deliveryFee;
  const totalPrice = Math.max(0, totalBeforeDiscount - discount);

  const toggleOption = (optId) => {
    setSelectedOptions((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
    // Reset promo if options change
    setDiscount(0);
    setPromoApplied(false);
    setPromoCode('');
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;
    if (!user) {
      toast.error('Connectez-vous pour utiliser un code promo.');
      return;
    }
    if (!days || days <= 0) {
      toast.error('Sélectionnez des dates de location avant d\'appliquer un code.');
      return;
    }
    setPromoLoading(true);
    try {
      // Call the authenticated backend endpoint – it validates date, is_active and min_price server-side.
      const res = await api.post('/promotions/apply', {
        code: promoCode.trim(),
        total_price: totalBeforeDiscount,
      });
      const match = res.data;
      let disc = 0;
      if (match.discount_type === 'percentage') {
        disc = totalBeforeDiscount * (match.discount_value / 100);
      } else {
        disc = match.discount_value;
      }
      setDiscount(disc);
      setPromoApplied(true);
      toast.success(`Code promo appliqué ! −${formatPrice(disc)}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Code promo invalide ou expiré.';
      toast.error(msg);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Veuillez vous connecter pour réserver.');
      navigate('/login', { state: { from: { pathname: `/car/${id}` } } });
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Veuillez sélectionner des dates.');
      return;
    }
    if (days <= 0) {
      toast.error('La date de fin doit être après la date de début.');
      return;
    }

    const isCustom = deliveryLocation === 'Livraison personnalisée';

    if (isCustom) {
      if (!deliveryAddress.trim()) {
        toast.error("Veuillez saisir votre adresse de livraison.");
        return;
      }
      if (!deliveryAddressConfirmed) {
        toast.error("Veuillez confirmer que l'adresse saisie est correcte.");
        return;
      }
      if (!deliveryLatitude || !deliveryLongitude) {
        toast.error("Veuillez sélectionner un point de livraison sur la carte ou utiliser la géolocalisation.");
        return;
      }
    }

    setShowPayment(true);
  };

  const handlePaymentComplete = async (method, paypalOrderId, signature) => {
    const isCustom = deliveryLocation === 'Livraison personnalisée';
    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', {
        vehicle_id: Number(id),
        start_date: startDate,
        end_date: endDate,
        total_price: totalPrice,
        selectedOptions,
        promotion_code: promoApplied ? promoCode.trim() : null,
        delivery_location: deliveryLocation,
        delivery_address: isCustom ? deliveryAddress : null,
        delivery_precision: isCustom ? deliveryPrecision : null,
        delivery_latitude: isCustom ? deliveryLatitude : null,
        delivery_longitude: isCustom ? deliveryLongitude : null,
        payment_method: method,
      });

      const booking = res.data;

      if (method === 'paypal') {
        await api.post(`/bookings/${booking.id}/pay-paypal`, {
          paypalOrderId,
        });
      }

      if (signature) {
        await api.post(`/bookings/${booking.id}/sign-contract`, {
          signature,
        });
      }

      return booking;
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    toast.success('Réservation confirmée !');
    navigate('/confirmation');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Connectez-vous pour laisser un avis.');
      return;
    }
    setReviewLoading(true);
    try {
      await api.post('/reviews', {
        vehicle_id: Number(id),
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Avis publié avec succès.');
      setReviewComment('');
      // Refresh reviews
      const rRes = await api.get(`/vehicles/${id}/reviews`);
      setReviews(rRes.data);
    } catch {
      toast.error("Impossible de publier l'avis.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-premium-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) return null;

  const specs = parseSpecs(vehicle.specs);
  const images = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images.map(img => img.url) 
    : (vehicle.image_url ? [vehicle.image_url] : []);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Payment overlay */}
      <AnimatePresence>
        {showPayment && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <PaymentForm
                total={totalPrice}
                vehicle={vehicle}
                startDate={startDate}
                endDate={endDate}
                selectedOptions={selectedOptions}
                optionsList={options}
                deliveryLocation={deliveryLocation}
                deliveryAddress={deliveryAddress}
                user={user}
                onComplete={handlePaymentComplete}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPayment(false)}
              />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox zoom overlay */}
      <AnimatePresence>
        {showLightbox && images.length > 0 && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 select-none"
            onClick={() => {
              setShowLightbox(false);
              setZoomScale(1);
            }}
          >
            {/* Zoom Controls */}
            <div className="absolute top-6 left-6 flex items-center gap-1 z-50 bg-black/55 p-2 rounded-xl backdrop-blur-md border border-white/10 shadow-lg" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 4))}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer"
                title="Zoomer (+)"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(prev => Math.max(prev - 0.5, 1))}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                title="Dézoomer (-)"
                disabled={zoomScale <= 1}
              >
                <ZoomOut size={18} />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                title="Réinitialiser"
                disabled={zoomScale <= 1}
              >
                <RotateCcw size={16} />
              </button>
              <div className="w-[1px] h-5 bg-white/20 mx-1"></div>
              <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider px-2 min-w-[50px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
            </div>

            {/* Close button */}
            <button 
              type="button"
              onClick={() => {
                setShowLightbox(false);
                setZoomScale(1);
              }}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50 shadow-md flex items-center justify-center cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Main high-res image container with overflow hidden to prevent scrollbars */}
            <div className="relative max-w-5xl w-full h-[75vh] flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>
              <Motion.img
                key={currentImageIndex}
                src={getFullImageUrl(images[currentImageIndex])}
                alt={`${vehicle.brand} ${vehicle.model}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: zoomScale, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                drag={zoomScale > 1}
                dragConstraints={{
                  left: -400 * (zoomScale - 1),
                  right: 400 * (zoomScale - 1),
                  top: -250 * (zoomScale - 1),
                  bottom: 250 * (zoomScale - 1)
                }}
                dragElastic={0.1}
                onDoubleClick={() => setZoomScale(prev => prev > 1 ? 1 : 2.5)}
                className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-200 select-none ${
                  zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                }`}
                onClick={(e) => {
                  if (zoomScale === 1) {
                    setZoomScale(2.5);
                  }
                }}
              />

              {images.length > 1 && zoomScale === 1 && (
                <>
                  {/* Left arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomScale(1);
                      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/25 border border-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Right arrow */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomScale(1);
                      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 hover:bg-white/25 border border-white/10 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Bar at the bottom */}
            {images.length > 1 && (
              <div className="absolute bottom-6 flex gap-3 max-w-full overflow-x-auto px-4 py-2 bg-black/40 rounded-2xl backdrop-blur-sm" onClick={e => e.stopPropagation()}>
                {images.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setZoomScale(1);
                      setCurrentImageIndex(i);
                    }}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      i === currentImageIndex ? 'border-premium-gold scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={getFullImageUrl(url)} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Basic Details Header */}
      <div className="bg-gray-100 py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 text-xs font-semibold rounded shadow-sm">
              {vehicle.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
              {vehicle.brand} <span className="text-gray-600 font-medium">{vehicle.model}</span>
            </h1>
            {avgRating && (
              <div className="flex items-center gap-2 mt-2">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-gray-700">{avgRating} / 5</span>
                <span className="text-gray-500 text-xs">({reviews.length} avis clients)</span>
              </div>
            )}
          </div>
          <div className="w-full md:w-[400px] h-60 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md flex-shrink-0 relative group">
            {images.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <Motion.img
                    key={currentImageIndex}
                    src={getFullImageUrl(images[currentImageIndex])}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover animate-fade cursor-zoom-in hover:brightness-95 transition-all"
                    onClick={() => setShowLightbox(true)}
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    {/* Left arrow */}
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-sm z-10"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Right arrow */}
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-sm z-10"
                    >
                      <ChevronRight size={18} />
                    </button>

                    {/* Dots indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCurrentImageIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                Aucune photo disponible
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: info + reviews */}
        <div className="lg:col-span-2 space-y-12">
          {/* About / Description */}
          {specs.description && (
            <section className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Info size={18} className="text-premium-gold" />
                Présentation du véhicule
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{specs.description}</p>
            </section>
          )}

          {/* Specs */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Caractéristiques techniques
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Année', value: vehicle.year || '—' },
                { label: 'Catégorie', value: vehicle.category || '—' },
                { label: 'Transmission', value: specs.transmission || '—' },
                { label: 'Carburant', value: specs.fuel || '—' },
                { label: 'Puissance', value: specs.power || '—' },
                { label: 'Places', value: specs.seats ? `${specs.seats} places` : '—' },
                { label: 'Portes', value: specs.doors ? `${specs.doors} portes` : '—' },
                { label: 'Bagages', value: specs.suitcases ? `${specs.suitcases} valise(s)` : '—' },
                { label: 'Kilométrage actuel', value: vehicle.current_mileage ? `${vehicle.current_mileage.toLocaleString()} km` : '—' },
              ].filter(item => item.value !== '—').map(({ label, value }) => (
                <div key={label} className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center shadow-sm">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-sm font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Equipments */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Équipements de confort inclus
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Climatisation', key: 'air_conditioning' },
                { name: 'GPS intégré', key: 'gps' },
                { name: 'Connexion Bluetooth', key: 'bluetooth' },
                { name: 'Régulateur de vitesse', key: 'cruise_control' },
                { name: 'Caméra de recul', key: 'backup_camera' },
              ].map((eq) => {
                const isIncluded = !!specs[eq.key];
                return (
                  <div 
                    key={eq.key} 
                    className={`flex items-center gap-3 p-4 border rounded-xl text-xs font-semibold shadow-sm transition-all ${
                      isIncluded 
                        ? 'bg-green-50/40 border-green-200 text-green-800' 
                        : 'bg-gray-50/30 border-gray-100 text-gray-400 line-through'
                    }`}
                  >
                    <Check size={16} className={isIncluded ? 'text-green-600' : 'text-gray-300'} />
                    <span>{eq.name}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Avis clients
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aucun avis n'a été laissé pour ce véhicule pour le moment.
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="border-b border-gray-200 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-gray-800">
                        {r.user_name || 'Client'}
                      </p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < r.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-200 fill-gray-200'
                            }
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Post a review */}
            {user && (
              <form id="review-form" onSubmit={handleReviewSubmit} className="mt-8 space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800">
                  Laisser un avis
                </h3>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className="p-0.5"
                    >
                      <Star
                        size={20}
                        className={
                          n <= reviewRating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 fill-gray-300'
                        }
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Votre commentaire..."
                  className="w-full bg-white border border-gray-300 rounded p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
                <button
                  id="review-submit"
                  type="submit"
                  disabled={reviewLoading}
                  className="px-5 py-2 bg-premium-gold hover:bg-premium-gold-light text-white text-sm font-semibold rounded shadow transition-all disabled:opacity-50"
                >
                  {reviewLoading ? 'Publication...' : 'Publier mon avis'}
                </button>
              </form>
            )}
          </section>
        </div>

        {/* Right: booking form */}
        <aside>
          <div className="sticky top-24 bg-white border border-gray-200 rounded-lg shadow-md p-6 space-y-6">
            <div className="flex justify-between items-baseline border-b border-gray-100 pb-4">
              <p className="text-2xl font-bold text-gray-900">
                {vehicle.price_per_day} €
              </p>
              <p className="text-sm text-gray-500">/ jour</p>
            </div>

            <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Visual Availability Calendar */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 block flex items-center gap-1.5">
                  <Calendar size={14} className="text-premium-gold" />
                  Sélectionnez vos dates de location
                </label>

                {/* Date Summary Card */}
                {startDate ? (
                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-3 flex items-center justify-between shadow-sm transition-all duration-300">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Votre Période</p>
                      <p className="text-xs font-semibold text-gray-800 flex flex-wrap items-center gap-1">
                        <span>Du {formatDateFrench(startDate)}</span>
                        {endDate && (
                          <>
                            <ChevronRight size={12} className="text-amber-500" />
                            <span>Au {formatDateFrench(endDate)}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setDiscount(0);
                        setPromoApplied(false);
                        setPromoCode('');
                      }}
                      className="p-1 hover:bg-amber-100 rounded-full text-amber-800 hover:text-amber-900 transition-colors"
                      title="Effacer la sélection"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-3 text-center transition-all duration-300">
                    <p className="text-xs text-gray-500">
                      Cliquez sur votre date de début puis de fin dans le calendrier ci-dessous.
                    </p>
                  </div>
                )}

                {/* Calendar Widget */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white p-3 shadow-inner">
                  {/* Month Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Weekday Names */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((day) => (
                      <span key={day} className="text-[10px] font-bold text-gray-400 uppercase">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {getDaysInMonth(currentMonth).map((d, index) => {
                      if (!d) return <div key={`empty-${index}`} className="aspect-square" />;

                      const isBooked = isDateBooked(d);
                      const isDisabled = isDateDisabled(d);
                      const isStart = startDate && d.toISOString().split('T')[0] === startDate;
                      const isEnd = endDate && d.toISOString().split('T')[0] === endDate;
                      const isRange = !isStart && !isEnd && (
                        (startDate && endDate && d >= new Date(startDate) && d <= new Date(endDate)) ||
                        (startDate && !endDate && hoveredDate && d >= new Date(startDate) && d <= new Date(hoveredDate))
                      );

                      let cellClass = "aspect-square flex items-center justify-center text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer relative ";
                      
                      if (isStart || isEnd) {
                        cellClass += "bg-premium-gold text-white shadow-sm font-bold scale-105 z-10";
                      } else if (isRange) {
                        cellClass += "bg-amber-100/70 text-amber-900 font-bold hover:bg-amber-200/80";
                      } else if (isBooked) {
                        cellClass += "bg-red-50 text-red-300 line-through cursor-not-allowed border border-red-100/50";
                      } else if (isDisabled) {
                        cellClass += "text-gray-300 cursor-not-allowed";
                      } else {
                        cellClass += "text-gray-700 hover:bg-gray-100 hover:text-gray-900";
                      }

                      return (
                        <button
                          key={d.getTime()}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleDayClick(d)}
                          onMouseEnter={() => !endDate && setHoveredDate(d.toISOString().split('T')[0])}
                          onMouseLeave={() => setHoveredDate(null)}
                          className={cellClass}
                          title={isBooked ? "Déjà réservé" : undefined}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Hidden inputs to preserve standard form submission */}
              <input type="hidden" name="startDate" value={startDate} required />
              <input type="hidden" name="endDate" value={endDate} required />

              {/* Delivery */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">
                    Lieu de livraison
                  </label>
                  <select
                    id="booking-delivery"
                    value={deliveryLocation}
                    onChange={(e) => {
                      setDeliveryLocation(e.target.value);
                      setDeliveryAddress('');
                      setDeliveryAddressConfirmed(false);
                      setDeliveryPrecision('');
                      setDeliveryLatitude(null);
                      setDeliveryLongitude(null);
                    }}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                  >
                    {DELIVERY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {deliveryLocation === 'Livraison personnalisée' && (
                  <div className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-700 block uppercase tracking-wider">
                        Adresse de livraison
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          placeholder="Saisissez votre adresse ou géolocalisez-vous"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded pl-3 pr-10 py-2 outline-none focus:border-blue-500 text-xs font-semibold"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleGeolocate}
                          disabled={geolocating}
                          title="Me géolocaliser"
                          className="absolute right-2 text-gray-400 hover:text-blue-600 transition-colors p-1"
                        >
                          {geolocating ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <MapPin size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                      <input
                        type="checkbox"
                        checked={deliveryAddressConfirmed}
                        onChange={(e) => setDeliveryAddressConfirmed(e.target.checked)}
                        className="accent-blue-600 flex-shrink-0"
                      />
                      <span className="text-[10px] text-gray-600 font-medium">Je confirme que cette adresse est correcte</span>
                    </label>

                    <p className="text-[10px] text-gray-500 leading-normal">
                      Vous pouvez également cliquer sur la carte ci-dessous pour ajuster le point exact.
                    </p>
                    
                    <div 
                      id="leaflet-delivery-map" 
                      style={{ height: '220px', width: '100%' }} 
                      className="rounded border border-gray-300 z-10"
                    ></div>

                    {deliveryLatitude && deliveryLongitude ? (
                      <p className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 rounded p-1.5 text-center">
                        Coordonnées : {deliveryLatitude.toFixed(6)}, {deliveryLongitude.toFixed(6)}
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded p-1.5 text-center animate-pulse">
                        Aucun point sélectionné sur la carte
                      </p>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-700 block uppercase tracking-wider">
                        Précisions de livraison (optionnel)
                      </label>
                      <textarea
                        placeholder="Digicode, étage, numéro de téléphone de contact..."
                        value={deliveryPrecision}
                        onChange={(e) => setDeliveryPrecision(e.target.value)}
                        rows={2}
                        className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 text-xs resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Options */}
              {options.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-gray-600">
                    Options supplémentaires
                  </p>
                  <div className="space-y-1.5">
                    {options.map((opt) => (
                      <label key={opt.id} className="flex items-center justify-between cursor-pointer group">
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedOptions.includes(opt.id)}
                            onChange={() => toggleOption(opt.id)}
                            className="accent-blue-600"
                          />
                          <span className="text-xs text-gray-700">
                            {opt.name}
                          </span>
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          +{opt.price} €/j
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Promo code */}
              <div className="space-y-1 pt-2">
                <p className="text-xs font-semibold text-gray-600">
                  Code promotionnel
                </p>
                <div className="flex gap-2">
                  <input
                    id="promo-code-input"
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoApplied(false);
                      setDiscount(0);
                    }}
                    placeholder="Entrez votre code"
                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-xs font-semibold uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    id="promo-apply-btn"
                    onClick={handlePromoCode}
                    disabled={promoLoading || !promoCode.trim() || !days}
                    className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1.5 rounded transition-colors disabled:opacity-40"
                  >
                    Appliquer
                  </button>
                </div>
              </div>

              {/* Price breakdown */}
              {days > 0 && (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Gamme ({vehicle.price_per_day} € × {days} jour{days > 1 ? 's' : ''})</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  {optionsPrice > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Options</span>
                      <span>+{formatPrice(optionsPrice)}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Frais de livraison</span>
                      <span>+{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600 font-bold">
                      <span>Code de réduction</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-3 mt-2">
                    <span className="text-gray-700">Total</span>
                    <span className="text-blue-600 text-lg">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              )}

              <button
                id="booking-submit"
                type="submit"
                disabled={bookingLoading || days <= 0}
                className="w-full py-3 bg-premium-gold hover:bg-premium-gold-light text-white font-bold text-sm rounded shadow transition-colors disabled:opacity-50 mt-2"
              >
                {bookingLoading ? 'Réservation...' : 'Confirmer la réservation'}
              </button>
            </form>

            <div className="flex items-center gap-2 justify-center border-t border-gray-100 pt-4">
              <Shield size={14} className="text-gray-400" />
              <p className="text-xs text-gray-500">
                Annulation gratuite sous 24h
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CarDetails;

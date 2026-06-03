import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gauge, Fuel, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFullImageUrl } from '../utils/imageUrl';

const CarCard = ({ car }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const getSafeSpecs = (specsStr) => {
    if (!specsStr) return {};
    try {
      return typeof specsStr === 'string' ? JSON.parse(specsStr) : specsStr;
    } catch (e) {
      console.error('Failed to parse specs:', e);
      return {};
    }
  };

  const specs = getSafeSpecs(car.specs);

  const images = car.images && car.images.length > 0 
    ? car.images.map(img => img.url) 
    : (car.image_url ? [car.image_url] : []);

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <Link to={`/car/${car.id}`} className="relative h-60 group overflow-hidden bg-gray-100">
        {images.length > 0 ? (
          <img 
            src={getFullImageUrl(images[currentImgIndex])} 
            alt={`${car.brand} ${car.model}`}
            loading="lazy"
            className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Aucune photo disponible
          </div>
        )}
        
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
            >
              <ChevronRight size={16} />
            </button>
            
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
              {images.map((_, i) => (
                <span 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentImgIndex ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 text-xs font-semibold rounded shadow-sm">
            {car.category}
          </span>
        </div>
      </Link>
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-blue-600 font-semibold mb-1">{car.brand}</p>
              <h3 className="text-lg font-bold text-gray-900">{car.model}</h3>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{car.price_per_day} €</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">/ jour</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-gray-100 mb-6 text-center">
            <div className="flex flex-col items-center border-r border-gray-100">
              <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 mb-1">Année</span>
              <span className="text-sm font-semibold text-gray-800">{car.year}</span>
            </div>
            <div className="flex flex-col items-center border-r border-gray-100">
              <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 mb-1">Puissance</span>
              <span className="text-sm font-semibold text-gray-800">{specs.power || '—'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 mb-1">Énergie</span>
              <span className="text-sm font-semibold text-gray-800">{specs.fuel || '—'}</span>
            </div>
          </div>
        </div>

        <Link 
          to={`/car/${car.id}`}
          className="block w-full text-center py-2.5 bg-premium-gold hover:bg-premium-gold-light text-white font-bold text-sm rounded transition-colors"
        >
          Réserver
        </Link>
      </div>
    </div>
  );
};

export default CarCard;
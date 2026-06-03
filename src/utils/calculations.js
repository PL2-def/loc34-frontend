/**
 * Utility functions for car rental calculations and formatting.
 */

/**
 * Calculates the number of days between two dates.
 * @param {string|Date} start 
 * @param {string|Date} end 
 * @returns {number}
 */
export const calculateDays = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  
  const diffTime = endDate - startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Calculates delivery fees based on location.
 * @param {string} location 
 * @returns {number}
 */
export const getDeliveryFee = (location) => {
  switch (location) {
    case 'A domicile': return 80;
    case 'Point personnalisé': return 100;
    case 'Livraison personnalisée': return 100;
    default: return 0;
  }
};

/**
 * Formats a price in Euro.
 * @param {number} price 
 * @returns {string}
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

/**
 * Safely parses specifications JSON.
 * @param {string|object} specs 
 * @returns {object}
 */
export const parseSpecs = (specs) => {
  if (!specs) return {};
  if (typeof specs === 'object') return specs;
  try {
    return JSON.parse(specs);
  } catch (e) {
    console.error('Failed to parse specs:', e);
    return {};
  }
};

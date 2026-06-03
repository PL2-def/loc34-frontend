import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook to handle asynchronous operations with loading and error states.
 * @param {Function} asyncFunction The async function to execute.
 * @param {Object} options Options for the hook.
 * @returns {Object} { execute, data, loading, error }
 */
export const useAsync = (asyncFunction, options = {}) => {
  const { 
    immediate = false, 
    successMessage = null, 
    errorMessage = 'Une erreur est survenue' 
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      setData(response.data || response);
      if (successMessage) {
        toast.success(successMessage);
      }
      return response.data || response;
    } catch (err) {
      const msg = err.response?.data?.error || errorMessage;
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, successMessage, errorMessage]);

  return { execute, data, loading, error, setData };
};

/**
 * @file hooks/useAuth.js
 * @description Custom hook for accessing the Authentication context.
 * Provides easy access to current user data, login, and logout functions.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextObject';

/**
 * useAuth hook
 * @returns {Object} The current authentication context value.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

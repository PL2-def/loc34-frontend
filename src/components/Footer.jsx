import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-premium-black text-white pt-12 pb-8 px-4 border-t border-gray-700">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">
            Loc 34
          </h3>
          <p className="text-gray-400 text-sm">
            Location de voitures simple et rapide.
          </p>
          <div className="flex gap-4">
            <Instagram size={18} className="text-gray-400 hover:text-premium-gold transition-colors cursor-pointer" />
            <Facebook size={18} className="text-gray-400 hover:text-premium-gold transition-colors cursor-pointer" />
            <Twitter size={18} className="text-gray-400 hover:text-premium-gold transition-colors cursor-pointer" />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold mb-4 text-premium-gold">Entreprise</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-white transition-colors">Voitures</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">Aide</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold mb-4 text-premium-gold">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Paris, France</li>
            <li>+33 1 23 45 67 89</li>
            <li>contact@loc34.com</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-700 text-center">
        <p className="text-gray-500 text-sm">
          &copy; 2026 Loc 34. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
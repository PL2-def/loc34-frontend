/**
 * @file pages/FAQ.jsx
 * @description Static Frequently Asked Questions page.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: "Quelles sont les conditions pour louer un véhicule ?",
    answer: "Vous devez être âgé d'au moins 25 ans, posséder un permis de conduire valide depuis plus de 3 ans, et présenter une pièce d'identité en cours de validité ainsi qu'une carte de crédit à votre nom pour la caution."
  },
  {
    question: "Comment fonctionne la caution ?",
    answer: "Une pré-autorisation est effectuée sur votre carte bancaire au moment de la remise des clés. Son montant varie selon la catégorie du véhicule (de 2500€ à 10000€). Cette somme n'est pas débitée, sauf en cas de dommage."
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer: "L'annulation est gratuite jusqu'à 48h avant le début de la location. Passé ce délai, 50% du montant total sera retenu. En cas de non-présentation, la totalité de la location est due."
  },
  {
    question: "Proposez-vous un service de livraison ?",
    answer: "Oui, nous livrons nos véhicules dans Paris intra-muros, aux aéroports (CDG, Orly) ainsi que dans les hôtels partenaires. Ce service est facturé selon la zone de livraison."
  },
  {
    question: "Le kilométrage est-il illimité ?",
    answer: "Nos forfaits standards incluent 250 km par jour. Tout kilomètre supplémentaire sera facturé selon le tarif en vigueur pour la catégorie du véhicule loué (de 1.50€ à 5€ / km)."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-premium-gold mb-4">
            Aide & Support
          </p>
          <h1 className="text-4xl font-serif text-premium-black mb-6">
            Questions Fréquentes
          </h1>
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus courantes concernant nos services
            de location de véhicules de prestige.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 py-6 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-serif text-lg text-premium-black pr-8">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`text-premium-gold transition-transform duration-300 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <Motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-8 pb-6 pt-2 text-gray-500 text-sm leading-relaxed border-t border-gray-50 bg-gray-50/50">
                      {faq.answer}
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center p-10 bg-premium-light-gray border border-gray-100">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-4">
            Vous ne trouvez pas la réponse ?
          </h3>
          <p className="text-sm text-gray-600 mb-8">
            Notre conciergerie est à votre entière disposition pour répondre à toutes vos demandes.
          </p>
          <Link 
            to="/contact" 
            className="inline-block px-10 py-4 bg-premium-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-premium-gold transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

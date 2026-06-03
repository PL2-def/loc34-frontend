/**
 * @file pages/Terms.jsx
 * @description Static Terms and Conditions page.
 */

import React from 'react';
import { motion as Motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-premium-black text-white pt-32 pb-20 px-6 md:px-12 text-center">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-premium-gold mb-6">
            Légal
          </p>
          <h1 className="text-4xl md:text-5xl font-serif mb-6">
            Conditions Générales
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed uppercase tracking-widest">
            Dernière mise à jour : 1er Janvier 2026
          </p>
        </Motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-20">
        <div className="space-y-16">
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              1. Objet
            </h2>
            <div className="text-sm text-gray-600 leading-loose space-y-4">
              <p>
                Les présentes Conditions Générales de Location (CGL) régissent l'ensemble des relations 
                contractuelles entre la société Loc 34 (le "Loueur") et toute personne physique 
                ou morale (le "Locataire") souhaitant bénéficier des services de location de véhicules.
              </p>
              <p>
                La validation d'une réservation sur la plateforme Loc 34 implique l'acceptation 
                sans réserve des présentes conditions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              2. Conditions Requises
            </h2>
            <div className="text-sm text-gray-600 leading-loose space-y-4">
              <p>Pour être autorisé à louer un véhicule, le Locataire doit :</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Être âgé d'au moins 25 ans révolus.</li>
                <li>Être titulaire d'un permis de conduire en cours de validité depuis au moins 3 ans.</li>
                <li>Présenter une pièce d'identité valide (carte d'identité ou passeport).</li>
                <li>Être titulaire d'une carte de crédit nominative pour le dépôt de garantie.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              3. Dépôt de Garantie
            </h2>
            <div className="text-sm text-gray-600 leading-loose space-y-4">
              <p>
                Un dépôt de garantie sous forme de pré-autorisation bancaire est obligatoire 
                avant la remise des clés. Son montant dépend de la catégorie du véhicule loué.
              </p>
              <p>
                Ce dépôt sera libéré dans un délai maximum de 72h après la restitution du véhicule, 
                sous réserve de l'absence de dommages constatés lors de l'état des lieux de retour.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              4. Assurance et Franchises
            </h2>
            <div className="text-sm text-gray-600 leading-loose space-y-4">
              <p>
                Tous nos véhicules sont couverts par une assurance tous risques. Cependant, en cas 
                de sinistre responsable ou sans tiers identifié, une franchise restera à la charge 
                du Locataire.
              </p>
              <p>
                Le montant de la franchise est spécifié dans les conditions particulières du contrat 
                de location signé lors de la remise du véhicule.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-gold mb-6">
              5. Utilisation du Véhicule
            </h2>
            <div className="text-sm text-gray-600 leading-loose space-y-4">
              <p>Le Locataire s'engage à utiliser le véhicule en "bon père de famille" et s'interdit :</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>De participer à des courses, rallyes ou essais sur circuit.</li>
                <li>De sous-louer le véhicule.</li>
                <li>De conduire sous l'emprise de l'alcool, de drogues ou de médicaments altérant la vigilance.</li>
                <li>De transporter des marchandises dangereuses.</li>
              </ul>
            </div>
          </section>

          <div className="pt-12 border-t border-gray-100">
            <p className="text-xs text-gray-400 italic text-center">
              Pour toute question relative à ces conditions, n'hésitez pas à contacter notre conciergerie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

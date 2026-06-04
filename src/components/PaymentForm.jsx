import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Wallet, Check, AlertCircle, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/calculations';

const PaymentForm = ({ 
  total, 
  vehicle, 
  startDate, 
  endDate, 
  selectedOptions, 
  optionsList, 
  deliveryLocation, 
  deliveryAddress, 
  user, 
  onComplete, 
  onSuccess, 
  onCancel 
}) => {
  const [paymentMethod, setPaymentMethod] = useState(total <= 0 ? 'cash' : 'paypal'); // 'paypal' or 'cash'
  const [step, setStep] = useState('contract'); // 'contract', 'input', 'processing', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  // Contract state
  const [contractAgreed, setContractAgreed] = useState(false);
  const [signature, setSignature] = useState(null);

  // Dynamically load the PayPal SDK script when 'paypal' is selected
  useEffect(() => {
    if (paymentMethod !== 'paypal') return;

    if (window.paypal) {
      const timer = setTimeout(() => setSdkLoaded(true), 0);
      return () => clearTimeout(timer);
    }

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
    const scriptId = 'paypal-sdk-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture`;
      script.id = scriptId;
      script.async = true;
      script.onload = () => {
        setTimeout(() => setSdkLoaded(true), 0);
      };
      script.onerror = () => {
        setTimeout(() => {
          setSdkError(true);
          toast.error("Impossible de charger le module de paiement PayPal.");
        }, 0);
      };
      document.body.appendChild(script);
    } else {
      const handleLoad = () => {
        setTimeout(() => setSdkLoaded(true), 0);
      };
      script.addEventListener('load', handleLoad);
      return () => {
        script.removeEventListener('load', handleLoad);
      };
    }
  }, [paymentMethod]);

  // Render the PayPal Smart Buttons once the SDK is loaded
  useEffect(() => {
    if (!sdkLoaded || paymentMethod !== 'paypal' || step !== 'input') return;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    
    // Clear previous button frames to prevent duplicate renderings
    container.innerHTML = '';

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'EUR',
                value: total.toFixed(2)
              },
              description: `Location de voiture Loc 34 - Total: ${total.toFixed(2)}€`
            }]
          });
        },
        onApprove: async (data, _actions) => {
          setStep('processing');
          setErrorMsg('');

          try {
            // Call parent onComplete with order ID and signature to trigger server-side capture
            await onComplete('paypal', data.orderID, signature);
            
            setStep('success');
            setTimeout(() => {
              if (onSuccess) onSuccess();
            }, 1500);
          } catch (err) {
            console.error('[PayPal Capture Error]:', err);
            setStep('error');
            const msg =
              err.response?.data?.error ||
              err.response?.data?.message ||
              err.message ||
              'Le paiement a été approuvé par PayPal mais la validation serveur a échoué. Veuillez contacter le support.';
            setErrorMsg(msg);
          }
        },
        onCancel: () => {
          toast.error('Paiement PayPal annulé par l\'utilisateur.');
        },
        onError: (err) => {
          console.error('[PayPal SDK Error]:', err);
          setStep('error');
          setErrorMsg('Une erreur technique est survenue avec le service de paiement PayPal. Veuillez réesayer.');
        }
      }).render('#paypal-button-container');
    } catch (err) {
      console.error('Error rendering PayPal buttons:', err);
    }
  }, [sdkLoaded, paymentMethod, total, step, onComplete, onSuccess, signature]);

  const handleCashSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod !== 'cash') return;

    setStep('processing');
    setErrorMsg('');

    try {
      // Direct booking creation for cash on site
      const apiPromise = onComplete('cash', null, signature);
      
      // Artificial delay for high-fidelity security presentation
      await Promise.all([
        apiPromise,
        new Promise((resolve) => setTimeout(resolve, 1500))
      ]);

      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('[Cash Booking Error]:', err);
      setStep('error');
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Impossible de finaliser votre réservation. Veuillez réessayer.';
      setErrorMsg(msg);
    }
  };

  const handleSaveSignature = (signatureDataUrl) => {
    setSignature(signatureDataUrl);
    setShowSignaturePad(false);
    setStep('input');
    toast.success('Contrat accepté et signé !');
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

  // Option helper
  const selectedOptionsDetailed = optionsList && selectedOptions
    ? optionsList.filter(o => selectedOptions.includes(o.id))
    : [];

  return (
    <div className={`bg-white p-6 md:p-8 border border-premium-gold/30 shadow-2xl mx-auto relative overflow-hidden transition-all duration-300 rounded-xl ${
      step === 'contract' ? 'max-w-2xl w-full' : 'max-w-md w-full'
    }`}>
      {/* Decorative top gold line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-premium-gold via-yellow-500 to-premium-gold"></div>

      <AnimatePresence mode="wait">
        {step === 'contract' && (
          <Motion.div
            key="contract-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-premium-gold" />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-premium-black">Étape 1 : Contrat de Location</h2>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold">1 / 2</span>
            </div>

            {/* Simulated paper contract */}
            <div className="max-h-[350px] overflow-y-auto bg-gray-50/70 p-5 border border-gray-200 rounded-lg text-left space-y-6 font-sans text-xs text-gray-700 shadow-inner">
              <div className="text-center pb-4 border-b border-gray-200">
                <h3 className="font-serif text-lg font-bold text-premium-black">CONTRAT DE LOCATION DE VÉHICULE</h3>
                <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">Loc 34 Services Premium</p>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <h4 className="font-bold text-gray-900 uppercase text-[9px] tracking-wider mb-1 text-premium-gold">Le Loueur</h4>
                  <p className="font-semibold text-gray-800">Loc 34 S.A.</p>
                  <p>123 Rue de la Location, 34500 Béziers</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 uppercase text-[9px] tracking-wider mb-1 text-premium-gold">Le Locataire</h4>
                  <p className="font-semibold text-gray-800">{user?.name || 'Client'}</p>
                  <p>{user?.email}</p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="border-t border-b border-gray-200 py-3 space-y-1.5 text-[11px]">
                <p><span className="font-semibold text-gray-800">Véhicule :</span> {vehicle?.brand} {vehicle?.model} ({vehicle?.category})</p>
                <p><span className="font-semibold text-gray-800">Période :</span> du {formatDateFrench(startDate)} au {formatDateFrench(endDate)}</p>
                <p><span className="font-semibold text-gray-800">Lieu de livraison :</span> {deliveryLocation} {deliveryAddress ? `(${deliveryAddress})` : ''}</p>
                {selectedOptionsDetailed.length > 0 && (
                  <p><span className="font-semibold text-gray-800">Options :</span> {selectedOptionsDetailed.map(o => o.name).join(', ')}</p>
                )}
                <p className="pt-1.5 text-sm font-bold text-gray-950 flex justify-between">
                  <span>Montant Total TTC :</span>
                  <span className="text-premium-gold">{total.toFixed(2)} €</span>
                </p>
              </div>

              {/* Improved Contract Articles */}
              <div className="space-y-4 text-[10px] text-gray-600 leading-relaxed">
                <div>
                  <p className="font-bold text-gray-900 uppercase text-[9px]">Article 1 - Objet et validité</p>
                  <p>Loc 34 met à disposition du locataire désigné le véhicule ci-dessus. Le locataire déclare posséder un permis de conduire valide depuis plus de 3 ans et être âgé de plus de 25 ans. Il s'engage à respecter scrupuleusement les présentes conditions contractuelles.</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 uppercase text-[9px]">Article 2 - Utilisation du véhicule</p>
                  <p>Le locataire est responsable du véhicule. Il s'engage à l'utiliser en bon père de famille, uniquement sur route carrossable, et exclut toute utilisation sur circuit, pour l'apprentissage, ou sous l'emprise d'alcool/stupéfiants. La sous-location est formellement interdite.</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 uppercase text-[9px]">Article 3 - État et carburant</p>
                  <p>Un état des lieux contradictoire sera réalisé à la livraison et à la restitution. Le locataire s'engage à restituer le véhicule avec un niveau de carburant identique au départ. Tout dommage non listé au départ sera facturé selon le barème en vigueur.</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 uppercase text-[9px]">Article 4 - Dépôt de Garantie & Franchise</p>
                  <p>Un dépôt de garantie obligatoire de 1500€ est requis. En cas de sinistre responsable ou de dommages, la franchise maximale restant à la charge du locataire est fixée à 1500€ par sinistre, sous réserve du respect des conditions générales d'assurance.</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 uppercase text-[9px]">Article 5 - Restitution tardive</p>
                  <p>Le véhicule doit être rendu à l'heure convenue. Tout retard non signalé de plus de 30 minutes entraînera une facturation supplémentaire forfaitaire de 50€ par heure entamée.</p>
                </div>
              </div>
            </div>

            {/* Checkbox agreement */}
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none py-2 text-left">
                  <input
                    type="checkbox"
                    checked={contractAgreed}
                    onChange={(e) => setContractAgreed(e.target.checked)}
                    className="mt-0.5 accent-premium-gold flex-shrink-0"
                  />
                  <span className="text-[11px] text-gray-600 leading-relaxed font-semibold">
                    J'ai lu, compris, et j'accepte sans réserve les termes du présent contrat de location et les conditions générales de vente de Loc 34.
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-premium-black transition-colors cursor-pointer text-center"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!contractAgreed) {
                        toast.error('Veuillez d\'abord accepter les termes du contrat.');
                        return;
                      }
                      const signText = `Accepté électroniquement par ${user?.name || 'Client'}`;
                      handleSaveSignature(signText);
                    }}
                    className={`flex-1 py-3.5 bg-premium-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-premium-gold transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                      !contractAgreed ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    Accepter et signer le contrat <ChevronRight size={12} />
                  </button>
                </div>
              </div>
          </Motion.div>
        )}

        {step === 'input' && (
          <Motion.div
            key="input-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-premium-black">Étape 2 : Paiement</h2>
                <p className="text-[8px] font-bold uppercase tracking-widest text-premium-gold mt-1">Contrat signé électroniquement</p>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold">2 / 2</span>
            </div>

            {/* Total due display */}
            <div className="mb-8 p-5 bg-premium-light-gray flex justify-between items-center border-l-2 border-premium-gold">
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-medium">Total à régler</span>
              <span className="text-2xl font-serif text-premium-black font-semibold">{total.toFixed(2)}€</span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                id="select-paypal-btn"
                disabled={total <= 0}
                onClick={() => setPaymentMethod('paypal')}
                className={`py-4 border rounded transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  total <= 0
                    ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-300'
                    : paymentMethod === 'paypal'
                    ? 'border-premium-gold bg-premium-gold/5 text-premium-black ring-1 ring-premium-gold/30'
                    : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 bg-white'
                }`}
              >
                <div className="text-lg font-bold italic select-none flex items-center">
                  <span className="text-[#003087]">Pay</span>
                  <span className="text-[#0079C1]">Pal</span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  {total <= 0 ? 'Indisponible à 0€' : 'En ligne sécurisé'}
                </span>
              </button>

              <button
                type="button"
                id="select-cash-btn"
                onClick={() => setPaymentMethod('cash')}
                className={`py-4 border rounded transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-premium-gold bg-premium-gold/5 text-premium-black ring-1 ring-premium-gold/30'
                    : 'border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 bg-white'
                }`}
              >
                <Wallet size={20} className={paymentMethod === 'cash' ? 'text-premium-gold' : 'text-gray-400'} />
                <span className="text-[8px] font-bold uppercase tracking-widest">En main propre</span>
              </button>
            </div>

            {paymentMethod === 'paypal' ? (
              /* PayPal Container View */
              <Motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-xs text-blue-800 leading-relaxed flex gap-2.5">
                  <ShieldCheck size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>Transaction cryptée et sécurisée par la passerelle de paiement officielle PayPal.</p>
                </div>

                {!sdkLoaded && !sdkError && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-10 h-10 border-4 border-premium-gold/25 border-t-premium-gold rounded-full animate-spin"></div>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">Chargement de PayPal...</span>
                  </div>
                )}

                {sdkError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 leading-relaxed text-center space-y-2">
                    <p>Erreur lors du chargement de PayPal.</p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-red-600 text-white rounded text-[10px] uppercase font-bold"
                    >
                      Recharger la page
                    </button>
                  </div>
                )}

                <div id="paypal-button-container" className="w-full relative z-10"></div>
              </Motion.div>
            ) : (
              /* Cash / Hand View Form */
              <form onSubmit={handleCashSubmit}>
                <Motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg text-xs text-amber-900 leading-relaxed flex gap-2.5">
                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Règlement direct en agence</p>
                      <p className="text-amber-800">Aucun montant ne sera débité en ligne aujourd'hui. Vous réglerez le montant total lors de la prise en charge.</p>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-gray-50 border border-gray-100 rounded-lg text-left">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Conditions requises sur place :</h4>
                    <ul className="text-xs text-gray-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-green-600 font-bold" />
                        <span>Permis de conduire original en cours de validité</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-green-600 font-bold" />
                        <span>Pièce d'identité correspondante</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={13} className="text-green-600 font-bold" />
                        <span>Dépôt de garantie par carte ou chèque bancaire (1500€)</span>
                      </li>
                    </ul>
                  </div>

                  <button 
                    type="submit"
                    id="confirm-cash-btn"
                    className="w-full py-4 bg-premium-black text-white font-bold uppercase tracking-[0.25em] text-[10px] hover:bg-premium-gold transition-all duration-500 shadow-md cursor-pointer flex items-center justify-center mt-6"
                  >
                    Valider la réservation sur place
                  </button>
                </Motion.div>
              </form>
            )}

            <button 
              type="button"
              id="cancel-payment-btn"
              onClick={() => setStep('contract')}
              className="w-full text-center text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-premium-black transition-colors py-2 mt-4 cursor-pointer"
            >
              Retourner à l'étape du contrat
            </button>

            {/* Secure seal footer */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100 mt-6">
              <Lock size={12} className="text-gray-400" />
              <span className="text-[8px] uppercase tracking-widest text-gray-400 font-medium">Protection des données SSL 256 bits</span>
            </div>
          </Motion.div>
        )}

        {step === 'processing' && (
          <Motion.div
            key="processing-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="relative mb-8">
              <div className="w-16 h-16 border-4 border-premium-gold/20 border-t-premium-gold rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock size={18} className="text-premium-gold animate-pulse" />
              </div>
            </div>
            
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-premium-black mb-3">
              {paymentMethod === 'paypal' ? 'Capture du paiement...' : 'Sécurisation de la demande...'}
            </h3>
            <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
              {paymentMethod === 'paypal' 
                ? 'Validation finale sécurisée de votre transaction en cours...' 
                : 'Enregistrement de vos coordonnées et de votre garantie.'}
            </p>
          </Motion.div>
        )}

        {step === 'success' && (
          <Motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Check size={28} className="text-green-600" />
              </Motion.div>
            </div>
            
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-green-700 mb-3">
              {paymentMethod === 'paypal' ? 'Paiement Approuvé' : 'Réservation Enregistrée'}
            </h3>
            <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
              {paymentMethod === 'paypal' 
                ? 'Votre paiement PayPal a été traité et vérifié avec succès.' 
                : 'Votre demande a été prise en compte avec succès.'}
            </p>
          </Motion.div>
        )}

        {step === 'error' && (
          <Motion.div
            key="error-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-8 shadow-inner flex-shrink-0">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <AlertCircle size={28} className="text-red-600" />
              </Motion.div>
            </div>
            
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-red-700 mb-3">
              Échec de la Réservation
            </h3>
            <p className="text-xs text-red-600 max-w-[260px] leading-relaxed mb-8 font-medium">
              {errorMsg}
            </p>

            <button
              type="button"
              id="retry-payment-btn"
              onClick={() => setStep('input')}
              className="px-6 py-2.5 bg-premium-black text-white font-bold uppercase tracking-wider text-[10px] hover:bg-premium-gold transition-all duration-300 shadow-md cursor-pointer"
            >
              Réessayer
            </button>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentForm;

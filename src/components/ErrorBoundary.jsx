import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white p-8 border border-gray-100 shadow-xl text-center">
            <h2 className="text-2xl font-serif text-red-600 mb-4">Oups ! Quelque chose s'est mal passé.</h2>
            <p className="text-gray-500 mb-8 font-light">
              Une erreur inattendue s'est produite. Nous vous prions de nous excuser pour ce désagrément.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-premium-black text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-premium-gold transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

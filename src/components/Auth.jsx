import React, { useState } from 'react';

const Auth = ({ onAuthenticate }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Compare with the password from .env file (Vite exposes it here)
    if (password === import.meta.env.VITE_APP_PASSWORD) {
      onAuthenticate(true);
    } else {
      setError('Mot de passe incorrect.');
      setPassword('');
    }
  };

  return (
    <div className="auth-container">
      <h2>Accès sécurisé</h2>
      <p>Veuillez entrer le mot de passe pour continuer.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          autoFocus
        />
        <button type="submit">Entrer</button>
      </form>
      {error && <p className="error">{error}</p>}
      <style>{`
        .auth-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 50vh;
        }
        .auth-container input {
          padding: 0.6em;
          margin-right: 0.5em;
          font-size: 1em;
        }
        .auth-container button {
           padding: 0.6em 1.2em;
        }
        .error {
          color: #ff6666;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Auth;

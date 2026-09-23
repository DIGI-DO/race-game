import React, { useState } from 'react';

export default function GameMultiplayer({ distance, onBack }) {
  const [gameCode, setGameCode] = useState('');
  const [mode, setMode] = useState('menu'); // menu, create, join, playing

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createGame = () => {
    const code = generateGameCode();
    setGameCode(code);
    setMode('playing');
    // TODO: Intégrer Firebase
  };

  const joinGame = () => {
    if (!gameCode || gameCode.length !== 6) {
      alert('Code invalide');
      return;
    }
    setMode('playing');
    // TODO: Intégrer Firebase
  };

  return (
    <div className="menu-container">
      <div className="menu-content">
        <button className="btn-back" onClick={onBack}>← Retour</button>

        {mode === 'menu' && (
          <>
            <h2>👥 Multijoueur</h2>
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => setMode('create')}>
                ➕ Créer une partie
              </button>
              <button className="btn btn-secondary" onClick={() => setMode('join')}>
                🔗 Rejoindre
              </button>
            </div>
          </>
        )}

        {mode === 'create' && (
          <>
            <h2>Créer une partie</h2>
            <div className="info-box">
              <p>Distance: <strong>{distance} km</strong></p>
              <p>Partage ce code avec tes amis:</p>
              <div className="game-code" onClick={createGame} style={{ cursor: 'pointer' }}>
                {generateGameCode()}
              </div>
              <button className="btn btn-primary" onClick={createGame}>
                Créer et jouer
              </button>
            </div>
          </>
        )}

        {mode === 'join' && (
          <>
            <h2>Rejoindre une partie</h2>
            <div className="info-box">
              <input
                type="text"
                placeholder="Code de jeu"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                maxLength="6"
                className="code-input"
              />
              <button className="btn btn-primary" onClick={joinGame}>
                Rejoindre
              </button>
            </div>
          </>
        )}

        {mode === 'playing' && (
          <div className="info-box">
            <p>Multijoueur en développement...</p>
            <p>Code: <strong>{gameCode}</strong></p>
            <p>Distance: <strong>{distance} km</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

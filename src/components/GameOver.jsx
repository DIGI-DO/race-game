import React from 'react';

export default function GameOver({ winner, distance, onBack }) {
  return (
    <div className="menu-container">
      <div className="menu-content">
        <div className="victory-container">
          <h1>🎉</h1>
          <h2>{winner} a gagné!</h2>
          <p>Vous avez parcourru {distance} km</p>
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={onBack}>
            🏠 Retour au menu
          </button>
        </div>
      </div>
    </div>
  );
}

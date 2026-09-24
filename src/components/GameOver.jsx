import React from "react";

export default function GameOver({ winner, distance, onBack }) {
  return (
    <div className="menu-container">
      <div className="menu-content">
        <div className="victory-container">
          <div className="trophy-animation">🏆</div>
          <h1>{winner}</h1>
          <h2>a remporté la victoire! 🎉</h2>
          <p className="victory-distance">
            Distance parcourue: <strong>{distance} km</strong>
          </p>
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

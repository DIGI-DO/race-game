import React, { useState } from "react";

const DISTANCES = [300, 500, 700, 1000, 1500];

export default function MainMenu({ onPlayLocal, onPlayMultiplayer }) {
  const [selected, setSelected] = useState(700);

  return (
    <div className="menu-container">
      <div className="menu-content">
        <h1>🏎️ Race Game</h1>
        <p className="subtitle">Jeu de course par cartes</p>

        <div className="distance-selector">
          <h3>Distance</h3>
          <div className="distance-buttons">
            {DISTANCES.map((dist) => (
              <button
                key={dist}
                className={`distance-btn ${selected === dist ? "active" : ""}`}
                onClick={() => setSelected(dist)}
              >
                {dist} km
              </button>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => onPlayLocal(selected)}
          >
            ▶️ Jouer contre l'IA
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onPlayMultiplayer(selected)}
          >
            👥 Multijoueur
          </button>
        </div>

        <div className="info-box">
          <h4>À propos</h4>
          <p>
            Soyez le premier à atteindre la distance selectionnée. Utilisez des
            cartes pour avancer et des pièges pour ralentir vos adversaires.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function PlayerSetup({ distance, onStart, onBack }) {
  const [player1Name, setPlayer1Name] = useState("Joueur 1");
  const [player2Name, setPlayer2Name] = useState("Joueur 2");
  const [gameMode, setGameMode] = useState("local"); // 'local' ou 'multiplayer'

  const handleStart = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      alert("Veuillez entrer les noms des deux joueurs");
      return;
    }
    onStart({
      player1: player1Name.trim(),
      player2: player2Name.trim(),
      mode: gameMode,
    });
  };

  return (
    <div className="menu-container">
      <div className="menu-content">
        <button className="btn-back" onClick={onBack}>
          ← Retour
        </button>

        <h2>⚙️ Paramètres de la partie</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Distance: <strong>{distance} km</strong>
        </p>

        <div className="setup-form">
          <div className="form-group">
            <label>👤 Joueur 1</label>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Votre nom"
              maxLength="15"
              className="input-name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>🎮 Joueur 2</label>
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="Adversaire"
              maxLength="15"
              className="input-name"
            />
          </div>

          <div className="form-group">
            <label>Mode</label>
            <div className="mode-selector">
              <button
                className={`mode-btn ${gameMode === "local" ? "active" : ""}`}
                onClick={() => setGameMode("local")}
              >
                🤖 vs IA
              </button>
              <button
                className={`mode-btn ${gameMode === "multiplayer" ? "active" : ""}`}
                onClick={() => setGameMode("multiplayer")}
              >
                👥 Multijoueur
              </button>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleStart}>
            ▶️ Lancer la partie
          </button>
        </div>
      </div>
    </div>
  );
}

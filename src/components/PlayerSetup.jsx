import React, { useState } from "react";

export default function PlayerSetup({ distance, onStart, onBack }) {
  const [gameMode, setGameMode] = useState("local"); // 'local' ou 'multiplayer'
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");

  const handleStart = () => {
    if (!player1Name.trim()) {
      alert("Veuillez entrer votre nom");
      return;
    }

    if (gameMode === "multiplayer" && !player2Name.trim()) {
      alert("Veuillez entrer le nom de l'adversaire");
      return;
    }

    const player2 = gameMode === "local" ? "IA" : player2Name.trim();
    onStart({ player1: player1Name.trim(), player2, mode: gameMode });
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
          {/* Mode selector */}
          <div className="form-group">
            <label>Mode de jeu</label>
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

          {/* Player name */}
          <div className="form-group">
            <label>👤 Votre nom</label>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="Entrez votre nom"
              maxLength="15"
              className="input-name"
              autoFocus
            />
          </div>

          {/* Opponent name (only for multiplayer) */}
          {gameMode === "multiplayer" && (
            <div className="form-group">
              <label>👥 Nom de l'adversaire</label>
              <input
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Entrez son nom"
                maxLength="15"
                className="input-name"
              />
            </div>
          )}

          {/* AI info */}
          {gameMode === "local" && (
            <div className="info-box">
              <p>Vous affronterez une IA aléatoire</p>
            </div>
          )}
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

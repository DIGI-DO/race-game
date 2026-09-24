import React, { useState, useEffect, useRef } from "react";
import { database } from "../firebase";
import { ref, set, get, onValue, remove, push } from "firebase/database";
import Card from "./Card";
import ProgressBar from "./ProgressBar";
import GameOver from "./GameOver";
import Notification from "./Notification";
import { InteractiveGame, Rules } from "../gameEngine";

export default function GameMultiplayer({ distance, playerNames, onBack }) {
  const [screen, setScreen] = useState("menu"); // menu, create, join, playing
  const [gameCode, setGameCode] = useState("");
  const [gameId, setGameId] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerIndex, setPlayerIndex] = useState(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [notification, setNotification] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const audioRef = useRef(null);

  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createGame = async () => {
    const code = generateGameCode();
    const newGameId = code.toLowerCase();

    try {
      const rules = new Rules({ distance, players: 2 });
      const newGame = new InteractiveGame(rules);

      const gameData = {
        code,
        distance,
        player1: playerNames.player1,
        player2: null,
        creator: playerNames.player1,
        created: new Date().toISOString(),
        state: newGame.getState(),
        status: "waiting", // waiting, playing, finished
      };

      const gameRef = ref(database, `games/${newGameId}`);
      await set(gameRef, gameData);

      setGameCode(code);
      setGameId(newGameId);
      setGame(newGame);
      setPlayerIndex(0);
      setIsCreator(true);
      setScreen("waiting");

      // Écouter les changements
      listenToGame(newGameId, newGame, 0);
    } catch (err) {
      showNotification("Erreur de création: " + err.message, "error");
    }
  };

  const joinGame = async () => {
    if (!gameCode || gameCode.length !== 6) {
      showNotification("Code invalide", "error");
      return;
    }

    const gameId = gameCode.toLowerCase();

    try {
      const gameRef = ref(database, `games/${gameId}`);
      const snapshot = await get(gameRef);

      if (!snapshot.exists()) {
        showNotification("Partie non trouvée", "error");
        return;
      }

      const gameData = snapshot.val();

      if (gameData.player2) {
        showNotification("Partie déjà pleine", "error");
        return;
      }

      // Mettre à jour le joueur 2
      await set(ref(database, `games/${gameId}/player2`), playerNames.player2);
      await set(ref(database, `games/${gameId}/status`), "playing");

      // Créer la partie
      const rules = new Rules({ distance, players: 2 });
      const newGame = new InteractiveGame(rules);

      setGame(newGame);
      setGameId(gameId);
      setGameCode(gameCode);
      setPlayerIndex(1);
      setScreen("playing");

      listenToGame(gameId, newGame, 1);
    } catch (err) {
      showNotification("Erreur: " + err.message, "error");
    }
  };

  const listenToGame = (gId, gameObj, pIndex) => {
    const gameRef = ref(database, `games/${gId}`);

    onValue(gameRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();

      if (data.player2 && pIndex === 0) {
        setOpponentConnected(true);
        setWaiting(false);
      }

      setGameState(data.state);
    });
  };

  const playCard = async (card) => {
    if (!game || playerIndex === null) return;

    try {
      const result = game.playCard(playerIndex, card);

      const updatedState = result.state;
      setGameState(updatedState);

      // Mettre à jour la base de données
      await set(ref(database, `games/${gameId}/state`), updatedState);

      if (result.winner !== null) {
        await set(ref(database, `games/${gameId}/status`), "finished");
        // GameOver affichera qui a gagné
      }
    } catch (err) {
      showNotification("Erreur: " + err.message, "error");
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const handleBackToMenu = () => {
    if (gameId && isCreator) {
      remove(ref(database, `games/${gameId}`));
    }
    onBack();
  };

  // Menu création/rejointe
  if (screen === "menu") {
    return (
      <div className="menu-container">
        <div className="menu-content">
          <button className="btn-back" onClick={onBack}>
            ← Retour
          </button>
          <h2>👥 Multijoueur</h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Distance: <strong>{distance} km</strong>
          </p>
          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={() => {
                setScreen("create");
                createGame();
              }}
            >
              ➕ Créer une partie
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setScreen("join")}
            >
              🔗 Rejoindre
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran de création (attendre le joueur 2)
  if (screen === "waiting") {
    return (
      <div className="menu-container">
        <div className="menu-content">
          <button className="btn-back" onClick={handleBackToMenu}>
            ← Annuler
          </button>
          <h2>⏳ Attente du joueur 2</h2>
          <div className="info-box">
            <p>Partage ce code:</p>
            <div className="game-code">{gameCode}</div>
            <p style={{ fontSize: "0.9em", color: "#999", marginTop: "15px" }}>
              {opponentConnected ? "✅ Joueur 2 connecté!" : "En attente..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Écran de rejointe
  if (screen === "join") {
    return (
      <div className="menu-container">
        <div className="menu-content">
          <button className="btn-back" onClick={() => setScreen("menu")}>
            ← Retour
          </button>
          <h2>Rejoindre une partie</h2>
          <div className="info-box">
            <input
              type="text"
              placeholder="Code de jeu"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              maxLength="6"
              className="code-input"
              autoFocus
            />
            <button className="btn btn-primary" onClick={joinGame}>
              Rejoindre
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Écran de jeu
  if (screen === "playing" && game && gameState) {
    const humanPlayer = gameState.players[playerIndex];
    const opponentPlayer = gameState.players[1 - playerIndex];
    const alive = gameState.active_players;
    const currentPlayerIndex = alive[gameState.turn % alive.length];
    const isYourTurn = currentPlayerIndex === playerIndex;

    if (gameState.status === "finished") {
      const winner = gameState.players[alive[0]]?.name;
      return (
        <GameOver
          winner={winner}
          distance={distance}
          onBack={handleBackToMenu}
        />
      );
    }

    return (
      <div className="game-container">
        <audio ref={audioRef} src="/media/music/soundeffect.mp3" loop />

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
          />
        )}

        <div className="game-header">
          <button className="btn-back" onClick={handleBackToMenu}>
            ← Retour
          </button>
          <h2>{distance} km</h2>
          <span className="turn-counter">Tour {gameState.turn}</span>
        </div>

        <div className="game-board">
          <div className="opponent-section">
            <div className="player-name-tag">{opponentPlayer.name}</div>
            <div className="opponent-hand">
              {opponentPlayer.hand.map((_, i) => (
                <div key={i} className="card-back">
                  <img src="/media/cards/back_card.png" alt="Carte" />
                </div>
              ))}
            </div>
            <ProgressBar
              current={opponentPlayer.km}
              target={distance}
              playerName={opponentPlayer.name}
            />
          </div>

          <div className="game-center">
            <div className="message-box">
              {isYourTurn
                ? `🎮 À vous de jouer!`
                : `💭 ${opponentPlayer.name} joue...`}
            </div>
          </div>

          <div className="player-section">
            <ProgressBar
              current={humanPlayer.km}
              target={distance}
              playerName={humanPlayer.name}
            />
            <div className="player-name-tag">{humanPlayer.name}</div>
            <div className="player-hand">
              {humanPlayer.hand.map((card) => (
                <Card
                  key={card}
                  card={card}
                  onClick={() => playCard(card)}
                  disabled={!isYourTurn}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

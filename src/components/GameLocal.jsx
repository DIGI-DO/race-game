import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import ProgressBar from "./ProgressBar";
import GameOver from "./GameOver";
import Notification from "./Notification";
import "../styles/GameLocal.css";

const CARD_MESSAGES = {
  30: (name) => `${name} a avancé de 30 km 🚗`,
  50: (name) => `${name} a avancé de 50 km 🚙`,
  90: (name) => `${name} a avancé de 90 km 🏎️`,
  110: (name) => `${name} a avancé de 110 km ⚡`,
  130: (name) => `${name} a avancé de 130 km 🔥`,
  police: (name, target) => `👮 ${target} s'est fait contrôler! Bloqué 1 tour`,
  embouteillage: (name, target) =>
    `🚗 Embouteillage! ${target} limité à 50 km/h`,
  detour: (name, target) => `🚧 Détour! ${target} doit parcourir 50km de plus`,
  accident: (name, target) => `💥 Accident! ${target} est bloqué 2 tours`,
  raccourci: (name) => `🛣️ ${name} a trouvé un raccourci! -50km 🎉`,
  casse_moteur: (name, target) => `💣 CASSE MOTEUR! ${target} est ÉLIMINÉ! 🔥`,
};

export default function GameLocal({ game, distance, playerNames, onBack }) {
  const [state, setState] = useState(game.getState());
  const [winner, setWinner] = useState(null);
  const [notification, setNotification] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [blockingAnimation, setBlockingAnimation] = useState(false);
  const audioRef = useRef(null);

  const humanPlayer = state.players[0];
  const aiPlayer = state.players[1];
  const alive = state.active_players;

  // Renommer les joueurs
  humanPlayer.name = playerNames.player1;
  aiPlayer.name = playerNames.player2;

  const currentPlayerIndex =
    alive.length > 0 ? alive[state.turn % alive.length] : 0;
  const isHumanTurn = currentPlayerIndex === 0 && !animating;

  // Lancer la musique au démarrage
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // Autoplay bloqué, c'est normal
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const playCard = (card) => {
    if (!isHumanTurn || animating) return;

    // Vérifier si le joueur est bloqué
    if (humanPlayer.skipped_turns > 0) {
      showNotification(
        `⏸️ Vous êtes bloqué pour ${humanPlayer.skipped_turns} tour(s) encore`,
        "warning",
      );
      return;
    }

    try {
      setAnimating(true);
      const result = game.playCard(0, card);

      // Message de progression
      if (card in { 30: 1, 50: 1, 90: 1, 110: 1, 130: 1 }) {
        showNotification(CARD_MESSAGES[card](playerNames.player1), "info");
      } else if (card === "raccourci") {
        showNotification(CARD_MESSAGES[card](playerNames.player1), "success");
      } else {
        const msg =
          CARD_MESSAGES[card]?.(playerNames.player1, playerNames.player2) ||
          "Carte jouée";
        showNotification(msg, "warning");
      }

      if (result.winner !== null) {
        setState(result.state);
        setWinner(result.winner);
        setAnimating(false);
        return;
      }

      setState(result.state);
      game.turn += 1;

      setTimeout(() => playAITurn(), 1200);
    } catch (err) {
      showNotification("Erreur: " + err.message, "error");
      setAnimating(false);
    }
  };

  const skipHumanTurn = () => {
    const humanPlayer = game.players[0];

    if (humanPlayer.skipped_turns > 0) {
      showNotification(
        `⏸️ ${playerNames.player1} passe son tour (bloqué ${humanPlayer.skipped_turns}t)`,
        "warning",
      );
      humanPlayer.skipped_turns -= 1;
      setState(game.getState());
      game.turn += 1;

      setBlockingAnimation(true);
      setTimeout(() => {
        setBlockingAnimation(false);
        setTimeout(() => playAITurn(), 800);
      }, 1200);
    }
  };

  const playAITurn = () => {
    const freshState = game.getState();
    const alive = freshState.active_players;

    if (alive.length <= 1) {
      if (alive.length === 1) {
        setWinner(alive[0]);
      }
      setAnimating(false);
      return;
    }

    // Vérifier si c'est le tour du joueur humain
    const nextPlayerIndex = alive[game.turn % alive.length];
    if (nextPlayerIndex === 0) {
      // C'est le tour du joueur humain
      const humanPlayer = game.players[0];
      if (humanPlayer.skipped_turns > 0) {
        // Le joueur est bloqué, passer automatiquement
        skipHumanTurn();
        return;
      }
      // Sinon, laisser le joueur jouer
      setAnimating(false);
      return;
    }

    // C'est le tour de l'IA
    const aiIndex = 1;
    const aiPlayer = game.players[aiIndex];

    // Tour bloqué - afficher l'animation
    if (aiPlayer.skipped_turns > 0) {
      setBlockingAnimation(true);
      showNotification(
        `⏸️ ${playerNames.player2} passe son tour (bloqué ${aiPlayer.skipped_turns}t)`,
        "warning",
      );
      aiPlayer.skipped_turns -= 1;
      setState(game.getState());
      game.turn += 1;
      setTimeout(() => {
        setBlockingAnimation(false);
        setTimeout(() => playAITurn(), 800);
      }, 1200);
      return;
    }

    // IA éliminée
    if (aiPlayer.eliminated) {
      showNotification(`❌ ${playerNames.player2} a été éliminé!`, "error");
      game.turn += 1;
      setState(game.getState());
      setTimeout(() => playAITurn(), 1200);
      return;
    }

    // Choisir une carte
    const playables = game.playable_cards(aiPlayer);
    if (playables.length === 0) {
      if (aiPlayer.speed_limit !== null) {
        aiPlayer.speed_limit = null;
      }
      showNotification(
        `⏸️ ${playerNames.player2} n'a pas de carte jouable`,
        "warning",
      );
      game.turn += 1;
      setState(game.getState());
      setTimeout(() => playAITurn(), 800);
      return;
    }

    // Jouer une carte aléatoire
    const card = playables[Math.floor(Math.random() * playables.length)];
    try {
      const result = game.playCard(aiIndex, card);

      // Afficher ce que l'IA a joué
      if (card in { 30: 1, 50: 1, 90: 1, 110: 1, 130: 1 }) {
        showNotification(CARD_MESSAGES[card](playerNames.player2), "info");
      } else if (card === "raccourci") {
        showNotification(CARD_MESSAGES[card](playerNames.player2), "success");
      } else {
        const msg =
          CARD_MESSAGES[card]?.(playerNames.player2, playerNames.player1) ||
          "Carte jouée";
        showNotification(msg, "warning");
      }

      if (result.winner !== null) {
        setState(result.state);
        setWinner(result.winner);
        setAnimating(false);
        return;
      }

      setState(result.state);
      game.turn += 1;
      setTimeout(() => playAITurn(), 1200);
    } catch (err) {
      console.error("Erreur IA:", err);
      setAnimating(false);
    }
  };

  if (winner !== null) {
    return (
      <GameOver
        winner={state.players[winner].name}
        distance={distance}
        onBack={onBack}
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
          duration={2000}
        />
      )}

      <div className="game-header">
        <button className="btn-back" onClick={onBack}>
          ← Retour
        </button>
        <h2>{distance} km</h2>
        <span className="turn-counter">Tour {state.turn}</span>
      </div>

      <div className="game-board">
        {/* Adversaire (IA) */}
        <div
          className={`opponent-section ${blockingAnimation ? "blocking-animation" : ""}`}
        >
          <div className="player-name-tag">{playerNames.player2}</div>
          <div className="opponent-hand">
            {aiPlayer.hand.map((_, i) => (
              <div key={i} className="card-back">
                <img src="/media/cards/back_card.png" alt="Carte" />
              </div>
            ))}
          </div>
          <ProgressBar
            current={aiPlayer.km}
            target={distance}
            playerName={playerNames.player2}
          />
          {aiPlayer.eliminated && <div className="eliminated">❌ ÉLIMINÉ</div>}
          {aiPlayer.skipped_turns > 0 && (
            <div className="status-badge blocked">
              ⏸️ Bloqué {aiPlayer.skipped_turns}t
            </div>
          )}
          {aiPlayer.speed_limit && (
            <div className="status-badge limited">
              🚗 {aiPlayer.speed_limit}km/h
            </div>
          )}
        </div>

        {/* Centre du jeu */}
        <div className="game-center">
          <div className="message-box">
            {isHumanTurn
              ? `🎮 À vous de jouer, ${playerNames.player1}!`
              : `💭 ${playerNames.player2} réfléchit...`}
          </div>
        </div>

        {/* Joueur (humain) */}
        <div className="player-section">
          <ProgressBar
            current={humanPlayer.km}
            target={distance}
            playerName={playerNames.player1}
          />
          <div className="player-name-tag">{playerNames.player1}</div>
          <div className="player-hand">
            {humanPlayer.hand.map((card) => (
              <Card
                key={card}
                card={card}
                onClick={() => playCard(card)}
                disabled={!isHumanTurn}
              />
            ))}
          </div>
          {humanPlayer.skipped_turns > 0 && (
            <div className="status-badge blocked">
              ⏸️ Bloqué {humanPlayer.skipped_turns}t
            </div>
          )}
          {humanPlayer.speed_limit && (
            <div className="status-badge limited">
              🚗 {humanPlayer.speed_limit}km/h
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

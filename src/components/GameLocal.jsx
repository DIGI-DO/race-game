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
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [blockingAnimation, setBlockingAnimation] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("Chargement...");
  const audioRef = useRef(null);
  const gameRef = useRef(game);

  // Mettre à jour la référence du jeu
  gameRef.current = game;

  // Lancer la musique au démarrage
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    }

    // Lancer le premier tour
    setTimeout(() => executeNextTurn(), 500);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
  };

  const refreshState = () => {
    setState(game.getState());
  };

  /**
   * Exécute le prochain tour du jeu
   */
  const executeNextTurn = () => {
    const state = game.getState();
    const alive = state.active_players;

    // Vérifier si la partie est finie
    if (alive.length <= 1) {
      if (alive.length === 1) {
        setWinner(alive[0]);
      }
      return;
    }

    // Déterminer à qui c'est le tour
    const currentPlayerIndex = alive[game.turn % alive.length];

    // C'est le tour du joueur humain
    if (currentPlayerIndex === 0) {
      handleHumanTurn();
    } else {
      // C'est le tour de l'IA
      executeAITurn();
    }
  };

  /**
   * Gère le tour du joueur humain
   */
  const handleHumanTurn = () => {
    const humanPlayer = game.players[0];

    // Le joueur est bloqué
    if (humanPlayer.skipped_turns > 0) {
      showNotification(
        `⏸️ ${playerNames.player1} passe son tour (bloqué ${humanPlayer.skipped_turns}t)`,
        "warning",
      );
      humanPlayer.skipped_turns -= 1;
      setBlockingAnimation(true);
      refreshState();

      setTimeout(() => {
        setBlockingAnimation(false);
        game.turn += 1;
        setTimeout(() => executeNextTurn(), 500);
      }, 1500);
      return;
    }

    // Le joueur peut jouer
    setWaitingForPlayer(true);
    setCurrentMessage(`🎮 À vous de jouer, ${playerNames.player1}!`);
  };

  /**
   * Exécute le tour de l'IA
   */
  const executeAITurn = () => {
    setWaitingForPlayer(false);
    setCurrentMessage(`💭 ${playerNames.player2} réfléchit...`);

    const aiPlayer = game.players[1];

    // L'IA est éliminée
    if (aiPlayer.eliminated) {
      showNotification(`❌ ${playerNames.player2} a été éliminé!`, "error");
      game.turn += 1;
      setTimeout(() => executeNextTurn(), 1000);
      return;
    }

    // L'IA est bloquée
    if (aiPlayer.skipped_turns > 0) {
      showNotification(
        `⏸️ ${playerNames.player2} passe son tour (bloqué ${aiPlayer.skipped_turns}t)`,
        "warning",
      );
      aiPlayer.skipped_turns -= 1;
      setBlockingAnimation(true);
      refreshState();

      setTimeout(() => {
        setBlockingAnimation(false);
        game.turn += 1;
        setTimeout(() => executeNextTurn(), 500);
      }, 1500);
      return;
    }

    // L'IA cherche une carte jouable
    const playables = game.playable_cards(aiPlayer);

    if (playables.length === 0) {
      // Aucune carte jouable
      if (aiPlayer.speed_limit !== null) {
        aiPlayer.speed_limit = null;
      }
      showNotification(
        `⏸️ ${playerNames.player2} n'a pas de carte jouable`,
        "warning",
      );
      refreshState();

      game.turn += 1;
      setTimeout(() => executeNextTurn(), 1000);
      return;
    }

    // L'IA choisit une carte aléatoire
    const card = playables[Math.floor(Math.random() * playables.length)];

    setTimeout(() => {
      try {
        const result = game.playCard(1, card);

        // Afficher le message de la carte
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

        // Vérifier si l'IA a gagné
        if (result.winner !== null) {
          refreshState();
          setWinner(result.winner);
          return;
        }

        refreshState();
        game.turn += 1;

        // Passer au tour suivant
        setTimeout(() => executeNextTurn(), 1200);
      } catch (err) {
        console.error("Erreur IA:", err);
      }
    }, 800);
  };

  /**
   * Le joueur joue une carte
   */
  const playCard = (card) => {
    if (!waitingForPlayer) return;

    const humanPlayer = game.players[0];

    // Vérifier si le joueur est bloqué
    if (humanPlayer.skipped_turns > 0) {
      showNotification(
        `⏸️ Vous êtes bloqué pour ${humanPlayer.skipped_turns} tour(s) encore`,
        "warning",
      );
      return;
    }

    try {
      setWaitingForPlayer(false);

      // Afficher le message de la carte
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

      // Jouer la carte
      const result = game.playCard(0, card);

      // Vérifier si le joueur a gagné
      if (result.winner !== null) {
        refreshState();
        setWinner(result.winner);
        return;
      }

      refreshState();
      game.turn += 1;

      // Passer au tour suivant
      setTimeout(() => executeNextTurn(), 1200);
    } catch (err) {
      showNotification("Erreur: " + err.message, "error");
      setWaitingForPlayer(true);
    }
  };

  if (winner !== null) {
    return (
      <GameOver
        winner={game.players[winner].name}
        distance={distance}
        onBack={onBack}
      />
    );
  }

  const humanPlayer = game.players[0];
  const aiPlayer = game.players[1];

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
          className={`opponent-section ${
            blockingAnimation ? "blocking-animation" : ""
          }`}
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
          <div className="message-box">{currentMessage}</div>
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
                disabled={!waitingForPlayer}
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

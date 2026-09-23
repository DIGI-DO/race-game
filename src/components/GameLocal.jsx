import React, { useState, useEffect } from 'react';
import Card from './Card';
import ProgressBar from './ProgressBar';
import GameOver from './GameOver';

export default function GameLocal({ game, distance, onBack }) {
  const [state, setState] = useState(game.getState());
  const [winner, setWinner] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [message, setMessage] = useState('Votre tour');

  const currentPlayer = state.active_players[state.turn % state.active_players.length];
  const isHumanTurn = currentPlayer === 0;
  const humanPlayer = state.players[0];
  const aiPlayer = state.players[1];

  const playCard = (card) => {
    if (!isHumanTurn) {
      setMessage('Ce n\'est pas votre tour');
      return;
    }

    try {
      const result = game.playCard(0, card);
      if (result.winner !== null) {
        setWinner(result.winner);
      }
      setState(result.state);
      setSelectedCard(null);
      game.turn += 1;
      
      // IA joue immédiatement après
      setTimeout(() => playAITurn(), 500);
    } catch (err) {
      setMessage('Erreur: ' + err.message);
    }
  };

  const playAITurn = () => {
    const aiIndex = 1;
    const aiPlayer = game.players[aiIndex];

    if (aiPlayer.eliminated) {
      game.turn += 1;
      setTimeout(() => checkTurnEnd(), 300);
      return;
    }

    if (aiPlayer.skipped_turns > 0) {
      aiPlayer.skipped_turns -= 1;
      setState(game.getState());
      game.turn += 1;
      setTimeout(() => checkTurnEnd(), 300);
      return;
    }

    const playables = game.playable_cards(aiPlayer);
    if (playables.length === 0 && aiPlayer.speed_limit !== null) {
      aiPlayer.speed_limit = null;
      setState(game.getState());
      game.turn += 1;
      setTimeout(() => checkTurnEnd(), 300);
      return;
    }

    if (playables.length > 0) {
      const card = playables[Math.floor(Math.random() * playables.length)];
      try {
        const result = game.playCard(aiIndex, card);
        if (result.winner !== null) {
          setWinner(result.winner);
        }
        setState(result.state);
        game.turn += 1;
      } catch (err) {
        console.error(err);
      }
    }

    setTimeout(() => checkTurnEnd(), 500);
  };

  const checkTurnEnd = () => {
    const state = game.getState();
    setState(state);

    const alive = state.active_players;
    if (alive.length === 1) {
      setWinner(alive[0]);
    } else if (alive.includes(0)) {
      setMessage('Votre tour');
    }
  };

  if (winner !== null) {
    return <GameOver winner={state.players[winner].name} distance={distance} onBack={onBack} />;
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <button className="btn-back" onClick={onBack}>← Retour</button>
        <h2>{distance} km</h2>
        <span className="turn-counter">Tour {state.turn}</span>
      </div>

      <div className="game-board">
        {/* Adversaire (IA) */}
        <div className="opponent-section">
          <div className="player-name">{aiPlayer.name}</div>
          <div className="opponent-hand">
            {aiPlayer.hand.map((_, i) => (
              <div key={i} className="card-back">🂠</div>
            ))}
          </div>
          <ProgressBar
            current={aiPlayer.km}
            target={distance}
            playerName={aiPlayer.name}
          />
          {aiPlayer.eliminated && <div className="eliminated">❌ Éliminé</div>}
        </div>

        {/* Centre du jeu */}
        <div className="game-center">
          <div className="message-box">{message}</div>
        </div>

        {/* Joueur (humain) */}
        <div className="player-section">
          <ProgressBar
            current={humanPlayer.km}
            target={distance}
            playerName={humanPlayer.name}
          />
          <div className="player-name">{humanPlayer.name}</div>
          <div className="player-hand">
            {humanPlayer.hand.map((card, i) => (
              <Card
                key={i}
                card={card}
                selected={selectedCard === card}
                onClick={() => playCard(card)}
                disabled={!isHumanTurn}
              />
            ))}
          </div>
          {humanPlayer.skipped_turns > 0 && (
            <div className="status-msg">⏸️ Bloqué ({humanPlayer.skipped_turns} tour)</div>
          )}
          {humanPlayer.speed_limit && (
            <div className="status-msg">🚗 Limité à {humanPlayer.speed_limit} km</div>
          )}
        </div>
      </div>
    </div>
  );
}

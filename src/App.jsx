import React, { useState, useEffect } from 'react';
import { InteractiveGame, Rules } from './gameEngine';
import GameLocal from './components/GameLocal';
import GameMultiplayer from './components/GameMultiplayer';
import MainMenu from './components/MainMenu';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('menu'); // menu, local, multiplayer
  const [distance, setDistance] = useState(700);
  const [game, setGame] = useState(null);

  const handlePlayLocal = (dist) => {
    const rules = new Rules({ distance: dist, players: 2 });
    const newGame = new InteractiveGame(rules);
    setDistance(dist);
    setGame(newGame);
    setScreen('local');
  };

  const handlePlayMultiplayer = (dist) => {
    const rules = new Rules({ distance: dist, players: 2 });
    setDistance(dist);
    setScreen('multiplayer');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
    setGame(null);
  };

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu onPlayLocal={handlePlayLocal} onPlayMultiplayer={handlePlayMultiplayer} />
      )}
      {screen === 'local' && game && (
        <GameLocal game={game} distance={distance} onBack={handleBackToMenu} />
      )}
      {screen === 'multiplayer' && (
        <GameMultiplayer distance={distance} onBack={handleBackToMenu} />
      )}
    </div>
  );
}

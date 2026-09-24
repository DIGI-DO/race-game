import React, { useState } from "react";
import { InteractiveGame, Rules } from "./gameEngine";
import GameLocal from "./components/GameLocal";
import GameMultiplayer from "./components/GameMultiplayer";
import MainMenu from "./components/MainMenu";
import PlayerSetup from "./components/PlayerSetup";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("menu"); // menu, setup, local, multiplayer
  const [distance, setDistance] = useState(700);
  const [game, setGame] = useState(null);
  const [playerNames, setPlayerNames] = useState({
    player1: "Joueur 1",
    player2: "Joueur 2",
  });
  const [gameMode, setGameMode] = useState("local");

  const handleSelectDistance = (dist) => {
    setDistance(dist);
    setScreen("setup");
  };

  const handleGameSetup = ({ player1, player2, mode }) => {
    setPlayerNames({ player1, player2 });
    setGameMode(mode);

    if (mode === "local") {
      const rules = new Rules({ distance, players: 2 });
      const newGame = new InteractiveGame(rules);
      setGame(newGame);
      setScreen("local");
    } else {
      setScreen("multiplayer");
    }
  };

  const handleBackToMenu = () => {
    setScreen("menu");
    setGame(null);
  };

  const handleBackToDistance = () => {
    setScreen("menu");
  };

  return (
    <div className="app">
      {screen === "menu" && (
        <MainMenu
          onPlayLocal={handleSelectDistance}
          onPlayMultiplayer={handleSelectDistance}
        />
      )}
      {screen === "setup" && (
        <PlayerSetup
          distance={distance}
          onStart={handleGameSetup}
          onBack={handleBackToDistance}
        />
      )}
      {screen === "local" && game && (
        <GameLocal
          game={game}
          distance={distance}
          playerNames={playerNames}
          onBack={handleBackToMenu}
        />
      )}
      {screen === "multiplayer" && (
        <GameMultiplayer
          distance={distance}
          playerNames={playerNames}
          onBack={handleBackToMenu}
        />
      )}
    </div>
  );
}

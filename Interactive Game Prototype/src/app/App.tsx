import { useState } from "react";
import { useGameState } from "./components/useGameState";
import { IntroScreen } from "./components/intro-screen";
import { GameScreen } from "./components/game-screen";
import { ResultScreen } from "./components/result-screen";
import { DebugMenu, DebugHotspot } from "./components/debug-menu";

export default function App() {
  const {
    state,
    setEmail,
    setConsent,
    startGame,
    addScore,
    loseLife,
    triggerGameOver,
    resetAll,
    bypassEmail,
  } = useGameState();

  const [debugOpen, setDebugOpen] = useState(false);

  return (
    <div className="size-full">
      <DebugHotspot onClick={() => setDebugOpen(true)} />

      {debugOpen && (
        <DebugMenu
          state={state}
          onBypassEmail={bypassEmail}
          onAddScore={addScore}
          onLoseLife={loseLife}
          onTriggerGameOver={triggerGameOver}
          onResetAll={() => {
            resetAll();
            setDebugOpen(false);
          }}
          onClose={() => setDebugOpen(false)}
        />
      )}

      {state.gameState === "idle" && (
        <IntroScreen
          email={state.email}
          emailEntered={state.emailEntered}
          consentChecked={state.consentChecked}
          onEmailChange={setEmail}
          onConsentChange={setConsent}
          onStart={startGame}
        />
      )}

      {state.gameState === "playing" && (
        <GameScreen
          score={state.score}
          lives={state.lives}
          speedMultiplier={state.speedMultiplier}
          onScore={addScore}
          onLoseLife={loseLife}
          gameState={state.gameState}
        />
      )}

      {state.gameState === "over" && (
        <ResultScreen score={state.score} onPlayAgain={resetAll} />
      )}
    </div>
  );
}

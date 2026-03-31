import { useState, useCallback } from "react";

export interface GameState {
  score: number;
  lives: number;
  speedMultiplier: number;
  emailEntered: boolean;
  consentChecked: boolean;
  gameState: "idle" | "playing" | "over";
  email: string;
}

const DEFAULT_STATE: GameState = {
  score: 0,
  lives: 3,
  speedMultiplier: 1.0,
  emailEntered: false,
  consentChecked: false,
  gameState: "idle",
  email: "",
};

export function useGameState() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);

  const setEmail = useCallback((email: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setState((s) => ({ ...s, email, emailEntered: isValid }));
  }, []);

  const setConsent = useCallback((checked: boolean) => {
    setState((s) => ({ ...s, consentChecked: checked }));
  }, []);

  const startGame = useCallback(() => {
    if (!state.emailEntered) return;
    setState((s) => ({ ...s, gameState: "playing" }));
  }, [state.emailEntered]);

  const addScore = useCallback((points: number) => {
    setState((s) => ({ ...s, score: s.score + points }));
  }, []);

  const loseLife = useCallback(() => {
    setState((s) => {
      const newLives = Math.max(0, s.lives - 1);
      return {
        ...s,
        lives: newLives,
        gameState: newLives === 0 ? "over" : s.gameState,
      };
    });
  }, []);

  const triggerGameOver = useCallback(() => {
    setState((s) => ({ ...s, lives: 0, gameState: "over" }));
  }, []);

  const resetAll = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const bypassEmail = useCallback(() => {
    setState((s) => ({ ...s, emailEntered: true, email: "debug@test.com" }));
  }, []);

  const setSpeedMultiplier = useCallback((v: number) => {
    setState((s) => ({ ...s, speedMultiplier: v }));
  }, []);

  return {
    state,
    setEmail,
    setConsent,
    startGame,
    addScore,
    loseLife,
    triggerGameOver,
    resetAll,
    bypassEmail,
    setSpeedMultiplier,
  };
}
